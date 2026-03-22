import { Router, Request, Response } from 'express';
import multer from 'multer';
import 'dotenv/config';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

const CLIENT_TTS_LANGS = new Set<string>();

// ── language config ────────────────────────────────────────────────────────
const LANG: Record<string, { code: string; model: string; name: string; voiceId: string }> = {
  en: { code: 'en',    model: 'nova-2', name: 'English',          voiceId: 'pNInz6obpgDQGcFmaJgB' }, // Adam
  zh: { code: 'zh-CN', model: 'nova-2', name: 'Mandarin Chinese', voiceId: '4VZIsMPtgggwNg7OXbPY' },
  ja: { code: 'ja',    model: 'nova-2', name: 'Japanese',         voiceId: 'Mv8AjrYZCBkdsmDHNwcB' },
  ko: { code: 'ko',    model: 'nova-2', name: 'Korean',           voiceId: 'fHzGR8qcnsDR2uaj9r16' },
  hi: { code: 'hi',    model: 'nova-2', name: 'Hindi',            voiceId: 'zgqefOY5FPQ3bB7OZTVR' },
  es: { code: 'es',    model: 'nova-2', name: 'Spanish',          voiceId: 'pNInz6obpgDQGcFmaJgB' },
  fr: { code: 'fr',    model: 'nova-2', name: 'French',           voiceId: 'pNInz6obpgDQGcFmaJgB' },
};

// ── prompts ────────────────────────────────────────────────────────────────

function buildSystemPrompt(
  language: string,
  missionContext?: string,
  flaggedWords: string[] = []
): string {
  const lang = LANG[language] ?? { name: language };
  const persona = `You are a friendly native ${lang.name} speaker helping a learner practice ${lang.name}. ALWAYS reply only in ${lang.name}, even when the learner makes mistakes — gently model correct usage in your response instead of correcting them explicitly. Keep replies conversational and under 60 words.`;
  const mission = missionContext
    ? `\n\nMISSION: The learner is trying to accomplish this goal through conversation: "${missionContext}". You have information that can help them, but make them ask for it naturally — don't volunteer the answer immediately.`
    : '';
  const pronSection = flaggedWords.length > 0
    ? `\n\nPRONUNCIATION FEEDBACK: The speech recognizer flagged these words as possibly mispronounced: ${flaggedWords.join(', ')}. For each flagged word populate the "pronunciationFeedback" array with: "word" (exact flagged word), "ipa" (correct IPA transcription for ${lang.name}), "tip" (one short English sentence on how to position mouth/tongue for the key sound — max 15 words), "category" (exactly one of: vowel-high-front, vowel-high-back, vowel-mid, vowel-low, consonant-bilabial, consonant-labiodental, consonant-dental, consonant-alveolar, consonant-postalveolar, consonant-palatal, consonant-velar, consonant-rhotic, consonant-lateral, consonant-glottal). Focus on the phoneme that is hardest for a native English speaker.`
    : '';
  const format = `\n\nYou MUST respond with valid JSON: {"reply":"...","missionComplete":false,"missionReason":"","pronunciationFeedback":[]}
IMPORTANT: Set missionComplete=true in the SAME turn where YOU reveal the key information the learner was seeking — not before, not after. Every other turn must have missionComplete=false. missionReason is a brief English sentence explaining what they learned (shown to the learner).`;
  return persona + mission + pronSection + format;
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

interface PronFeedbackItem {
  word: string;
  ipa: string;
  tip: string;
  category: string;
}

interface GeminiResult {
  reply: string;
  missionComplete: boolean;
  missionReason: string;
  pronunciationFeedback: PronFeedbackItem[];
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
  history: HistoryMessage[],
  flaggedWords: string[] = []
): Promise<GeminiResult> {
  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: transcript }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(language, missionContext, flaggedWords) }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 700,
          temperature: 1.0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              reply:           { type: 'STRING' },
              missionComplete: { type: 'BOOLEAN' },
              missionReason:   { type: 'STRING' },
              pronunciationFeedback: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    word:     { type: 'STRING' },
                    ipa:      { type: 'STRING' },
                    tip:      { type: 'STRING' },
                    category: { type: 'STRING' },
                  },
                  required: ['word', 'ipa', 'tip', 'category'],
                },
              },
            },
            required: ['reply', 'missionComplete', 'missionReason', 'pronunciationFeedback'],
          },
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
      pronunciationFeedback: parsed.pronunciationFeedback ?? [],
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
          pronunciationFeedback: parsed.pronunciationFeedback ?? [],
        };
      } catch { /* fall through */ }
    }
    return { reply: raw, missionComplete: false, missionReason: '', pronunciationFeedback: [] };
  }
}

// ── TTS (ElevenLabs) ───────────────────────────────────────────────────────

async function synthesizeSpeech(text: string, language: string): Promise<string> {
  const cfg = LANG[language] ?? LANG['en'];
  const model = language === 'en' ? 'eleven_flash_v2_5' : 'eleven_multilingual_v2';
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}`, {
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

    const flaggedWords = pronunciationIssues.map((w) => w.word);
    const { reply, missionComplete, missionReason, pronunciationFeedback } =
      await generateResponse(transcript, language, missionContext, history, flaggedWords);

    sse(res, { step: 'speaking', response: reply });

    const useClientTTS = CLIENT_TTS_LANGS.has(language);
    const audioB64 = useClientTTS ? undefined : await synthesizeSpeech(reply, language);

    sse(res, {
      step: 'done',
      transcript,
      response: reply,
      ...(useClientTTS ? { useClientTTS: true } : { audio: audioB64 }),
      pronunciationIssues,
      pronunciationFeedback,
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
