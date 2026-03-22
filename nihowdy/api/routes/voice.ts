import { Router, Request, Response } from 'express';
import multer from 'multer';
import 'dotenv/config';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;

const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam — multilingual v2

// ── language config ────────────────────────────────────────────────────────
const LANG: Record<string, { code: string; model: string; name: string }> = {
  en: { code: 'en',    model: 'nova-2', name: 'English' },
  zh: { code: 'zh-CN', model: 'nova-2', name: 'Mandarin Chinese' },
  ja: { code: 'ja',    model: 'nova-2', name: 'Japanese' },
  ko: { code: 'ko',    model: 'nova-2', name: 'Korean' },
  es: { code: 'es',    model: 'nova-2', name: 'Spanish' },
  fr: { code: 'fr',    model: 'nova-2', name: 'French' },
};

// ── prompts ────────────────────────────────────────────────────────────────

function buildSystemPrompt(language: string, missionContext?: string): string {
  const lang = LANG[language] ?? { name: language };
  const persona = `You are a friendly native ${lang.name} speaker helping a learner practice ${lang.name}. ALWAYS reply only in ${lang.name}, even when the learner makes mistakes — gently model correct usage in your response instead of correcting them explicitly. Keep replies conversational and under 60 words.`;
  const mission = missionContext
    ? `\n\nMISSION: The learner is trying to accomplish this goal through conversation: "${missionContext}". You have information that can help them, but make them ask for it naturally — don't volunteer the answer immediately.`
    : '';
  const format = `\n\nRespond with ONLY valid JSON (no markdown, no code fences):
{"reply":"your ${lang.name} response","missionComplete":false,"missionReason":""}
Set missionComplete=true when the learner has clearly obtained the information they were looking for based on what you just told them. missionReason is a brief English explanation (shown to the learner).`;
  return persona + mission + format;
}

// ── types ──────────────────────────────────────────────────────────────────

interface WordResult {
  word: string;
  confidence: number;
}

interface HistoryMessage {
  role: 'user' | 'model';
  content: string;
}

interface GeminiResult {
  reply: string;
  missionComplete: boolean;
  missionReason: string;
}

// ── STT (Deepgram) ─────────────────────────────────────────────────────────

async function transcribeAudio(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ transcript: string; words: WordResult[] }> {
  const cfg = LANG[language] ?? { code: language, model: 'nova-2' };
  const res = await fetch(
    `https://api.deepgram.com/v1/listen?model=${cfg.model}&smart_format=true&language=${cfg.code}&words=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': mimeType.split(';')[0],
      },
      body: new Uint8Array(buffer),
    }
  );
  if (!res.ok) throw new Error(`Deepgram ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const alt = data?.results?.channels?.[0]?.alternatives?.[0];
  const transcript: string = (alt?.transcript ?? '').trim();
  const words: WordResult[] = (alt?.words ?? []).map(
    (w: { punctuated_word?: string; word: string; confidence: number }) => ({
      word: w.punctuated_word ?? w.word,
      confidence: w.confidence,
    })
  );
  return { transcript, words };
}

// ── LLM (Gemini) ───────────────────────────────────────────────────────────

async function generateResponse(
  transcript: string,
  language: string,
  missionContext: string | undefined,
  history: HistoryMessage[]
): Promise<GeminiResult> {
  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: transcript }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(language, missionContext) }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 550,
          temperature: 1.0,
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw: string = data.candidates[0].content.parts[0].text;
  try {
    const parsed = JSON.parse(raw) as GeminiResult;
    return {
      reply: parsed.reply ?? raw,
      missionComplete: parsed.missionComplete ?? false,
      missionReason: parsed.missionReason ?? '',
    };
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as GeminiResult;
        return {
          reply: parsed.reply ?? raw,
          missionComplete: parsed.missionComplete ?? false,
          missionReason: parsed.missionReason ?? '',
        };
      } catch { /* fall through */ }
    }
    return { reply: raw, missionComplete: false, missionReason: '' };
  }
}

// ── TTS (ElevenLabs) ───────────────────────────────────────────────────────

async function synthesizeSpeech(text: string, language: string): Promise<string> {
  const model = language === 'en' ? 'eleven_flash_v2_5' : 'eleven_multilingual_v2';
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer()).toString('base64');
}

// ── SSE helper ─────────────────────────────────────────────────────────────

function sse(res: Response, data: object) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ── route ──────────────────────────────────────────────────────────────────

router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No audio provided' });
    return;
  }

  const language = (req.body.language as string) || 'en';
  const missionContext = (req.body.missionContext as string) || undefined;
  let history: HistoryMessage[] = [];
  try {
    history = JSON.parse((req.body.history as string) || '[]');
  } catch { /* ignore */ }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    sse(res, { step: 'transcribing' });
    const { transcript, words } = await transcribeAudio(file.buffer, file.mimetype, language);

    if (!transcript) {
      sse(res, { step: 'error', error: 'Could not hear anything — try again.' });
      res.end();
      return;
    }

    const pronunciationIssues = words.filter((w) => w.confidence < 0.75);
    sse(res, { step: 'thinking', transcript, pronunciationIssues });

    const { reply, missionComplete, missionReason } = await generateResponse(
      transcript, language, missionContext, history
    );

    sse(res, { step: 'speaking', response: reply });
    const audioB64 = await synthesizeSpeech(reply, language);

    sse(res, {
      step: 'done',
      transcript,
      response: reply,
      audio: audioB64,
      pronunciationIssues,
      missionComplete,
      missionReason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[voice]', message);
    sse(res, { step: 'error', error: message });
  } finally {
    res.end();
  }
});

export default router;
