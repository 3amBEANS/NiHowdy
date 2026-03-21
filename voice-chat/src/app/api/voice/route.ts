import { NextRequest } from 'next/server';

export const maxDuration = 55;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;

const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam — works with multilingual v2

// ── language config ────────────────────────────────────────────────────────
// deepgramModel: nova-3 is English-optimised; nova-2 has better CJK support
const LANG: Record<string, { code: string; model: string; name: string }> = {
  en: { code: 'en',    model: 'nova-3', name: 'English' },
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

  // Asking Gemini to return structured JSON lets us check mission completion
  // without a second API round-trip.
  const format = `\n\nRespond with ONLY valid JSON (no markdown, no code fences):
{"reply":"your ${lang.name} response","missionComplete":false,"missionReason":""}
Set missionComplete=true when the learner has clearly obtained the information they were looking for based on what you just told them. missionReason is a brief English explanation (shown to the learner).`;

  return persona + mission + format;
}

// ── STT (Deepgram) ─────────────────────────────────────────────────────────

export interface WordResult {
  word: string;
  confidence: number;
}

async function transcribeAudio(
  audio: Blob,
  language: string
): Promise<{ transcript: string; words: WordResult[] }> {
  const cfg = LANG[language] ?? { code: language, model: 'nova-2' };
  const buf = await audio.arrayBuffer();

  const res = await fetch(
    `https://api.deepgram.com/v1/listen?model=${cfg.model}&smart_format=true&language=${cfg.code}&words=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audio.type || 'audio/webm',
      },
      body: buf,
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

export interface HistoryMessage {
  role: 'user' | 'model';
  content: string;
}

interface GeminiResult {
  reply: string;
  missionComplete: boolean;
  missionReason: string;
}

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
    // Gemini occasionally wraps JSON in markdown — strip and retry
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
  // eleven_flash_v2_5 is English-only; multilingual_v2 handles everything else
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

function sse(writer: WritableStreamDefaultWriter, data: object) {
  return writer.write(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

// ── route ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const audio = form.get('audio');
  if (!audio || !(audio instanceof Blob)) {
    return new Response(JSON.stringify({ error: 'No audio provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const language = (form.get('language') as string) || 'en';
  const missionContext = (form.get('missionContext') as string) || undefined;

  let history: HistoryMessage[] = [];
  try {
    history = JSON.parse((form.get('history') as string) || '[]');
  } catch { /* ignore */ }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    try {
      await sse(writer, { step: 'transcribing' });
      const { transcript, words } = await transcribeAudio(audio, language);

      if (!transcript) {
        await sse(writer, { step: 'error', error: 'Could not hear anything — try again.' });
        return;
      }

      // Words where Deepgram had low confidence → likely pronunciation issues
      const pronunciationIssues = words.filter((w) => w.confidence < 0.75);

      await sse(writer, { step: 'thinking', transcript, pronunciationIssues });

      const { reply, missionComplete, missionReason } = await generateResponse(
        transcript,
        language,
        missionContext,
        history
      );

      await sse(writer, { step: 'speaking', response: reply });
      const audioB64 = await synthesizeSpeech(reply, language);

      await sse(writer, {
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
      console.error('[voice/route]', message);
      await sse(writer, { step: 'error', error: message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
