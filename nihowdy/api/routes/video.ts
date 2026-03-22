import { Router, Request, Response } from 'express';
// Import the ESM bundle directly — the package's `main` field incorrectly
// points to the CJS file which breaks named imports in Node.js ESM.
// @ts-ignore — no declaration file for the sub-path; types are declared below.
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';

// Minimal type shim for the youtube-transcript package
interface YTTranscriptItem { text: string; duration: number; offset: number; lang?: string; }
interface YTTranscriptOptions { lang?: string; fetch?: typeof fetch; }
declare const YoutubeTranscript: {
  fetchTranscript(videoId: string, opts?: YTTranscriptOptions): Promise<YTTranscriptItem[]>;
};
import 'dotenv/config';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// ── types ──────────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface ProcessedWord {
  text: string;
  difficulty: number; // 1 (A1) – 5 (C1+)
  translation?: string;
}

export interface ProcessedSegment {
  start: number;
  duration: number;
  originalText: string;
  translatedText: string;
  words: ProcessedWord[];
}

export interface VideoAnalysis {
  overallDifficulty: number;
  targetLanguage: string;
  segments: ProcessedSegment[];
}

// ── YouTube transcript fetch ───────────────────────────────────────────────
// Uses the youtube-transcript package which handles ASR, manual, and
// auto-translated tracks correctly across all video types.

async function fetchYouTubeTranscript(
  videoId: string,
  preferredLang = 'en'
): Promise<TranscriptSegment[]> {
  console.log(`[video] Fetching transcript for ${videoId}, preferredLang=${preferredLang}`);

  // youtube-transcript returns { text, duration, offset } where offset/duration are in ms
  const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: preferredLang }).catch(
    async (err: Error) => {
      // If the preferred language fails, fall back to English, then to any available lang
      console.warn(`[video] Lang "${preferredLang}" failed (${err.message}), trying "en"...`);
      return YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }).catch(async (err2: Error) => {
        console.warn(`[video] "en" also failed (${err2.message}), trying without lang filter...`);
        return YoutubeTranscript.fetchTranscript(videoId);
      });
    }
  );

  if (!raw || raw.length === 0) {
    throw new Error('No transcript segments returned. This video may not have captions available.');
  }

  console.log(`[video] Fetched ${raw.length} transcript segments`);

  // Decode HTML entities that youtube-transcript sometimes leaves in (e.g. &#39; → ')
  const decodeHtml = (str: string) =>
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

  return raw
    .map((item: YTTranscriptItem) => ({
      start: item.offset / 1000,
      duration: item.duration / 1000,
      text: decodeHtml(item.text).replace(/\n/g, ' ').trim(),
    }))
    .filter((s: TranscriptSegment) => s.text.length > 0);
}

// ── Gemini: difficulty + translation ──────────────────────────────────────
// Uses a compact prompt: translate each segment + identify hard words only.
// This keeps output small to avoid token-limit truncation.

interface GeminiSegmentResult {
  index: number;
  translatedText: string;
  hardWords: Array<{ word: string; difficulty: number; translation: string }>;
}

interface GeminiAnalysisResult {
  overallDifficulty: number;
  segments: GeminiSegmentResult[];
}

async function analyzeTranscript(
  segments: TranscriptSegment[],
  targetLanguage: string,
  nativeLanguage = 'English'
): Promise<VideoAnalysis> {
  // Process in batches of 25 to stay well within token limits
  const BATCH_SIZE = 25;
  const batch = segments.slice(0, BATCH_SIZE);
  const segmentTexts = batch.map((s, i) => `[${i}] ${s.text}`).join('\n');

  const prompt = `You are a language learning assistant analyzing ${targetLanguage} subtitles.

For each segment below, provide:
1. A natural ${nativeLanguage} translation
2. Only the HARD or UNUSUAL words (skip common/basic words). For each hard word: the exact word as it appears, difficulty 1-5 (1=A1 beginner, 5=C1+ advanced), and its ${nativeLanguage} meaning.

Also give an overall difficulty rating (1-5) for the whole transcript.

Segments:
${segmentTexts}

Reply with ONLY this JSON (no markdown, no extra text):
{"overallDifficulty":3,"segments":[{"index":0,"translatedText":"...","hardWords":[{"word":"...","difficulty":3,"translation":"..."}]}]}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  console.log(`[video] Gemini response keys:`, Object.keys(data));

  if (!data.candidates?.length) {
    console.error('[video] Gemini returned no candidates:', JSON.stringify(data).slice(0, 300));
    // Fallback: return transcript without analysis
    return {
      overallDifficulty: 3,
      targetLanguage,
      segments: segments.slice(0, BATCH_SIZE).map((seg) => ({
        start: seg.start,
        duration: seg.duration,
        originalText: seg.text,
        translatedText: '',
        words: seg.text.split(/\s+/).map((w) => ({ text: w, difficulty: 1, translation: undefined })),
      })),
    };
  }

  // Check for finish reason (token limit hit)
  const candidate = data.candidates[0];
  const finishReason = candidate?.finishReason;
  if (finishReason && finishReason !== 'STOP') {
    console.warn(`[video] Gemini finishReason=${finishReason}`);
  }

  const raw: string = candidate?.content?.parts?.[0]?.text ?? '';
  console.log(`[video] Gemini raw response length: ${raw.length}, finishReason: ${finishReason}`);
  if (raw.length < 500) console.log(`[video] Gemini full raw:`, raw);
  else console.log(`[video] Gemini raw (first 300):`, raw.slice(0, 300));

  let geminiResult: GeminiAnalysisResult;
  try {
    geminiResult = JSON.parse(raw);
    console.log(`[video] Gemini parsed OK, segments: ${geminiResult.segments?.length}`);
  } catch (parseErr) {
    console.error(`[video] Gemini JSON.parse failed: ${(parseErr as Error).message}`);
    console.error(`[video] Raw tail (last 200 chars):`, raw.slice(-200));
    // Graceful fallback — use empty translations rather than crashing
    console.warn('[video] Falling back to no-analysis mode (subtitles without translations)');
    geminiResult = {
      overallDifficulty: 3,
      segments: batch.map((_, i) => ({ index: i, translatedText: '', hardWords: [] })),
    };
  }

  // Build a lookup map of hard words per segment index
  const hardWordMap = new Map<number, Map<string, { difficulty: number; translation: string }>>();
  for (const seg of geminiResult.segments ?? []) {
    const wordMap = new Map<string, { difficulty: number; translation: string }>();
    for (const hw of seg.hardWords ?? []) {
      wordMap.set(hw.word.toLowerCase(), { difficulty: hw.difficulty, translation: hw.translation });
    }
    hardWordMap.set(seg.index, wordMap);
  }

  // Build ProcessedSegments for the batch
  const translationMap = new Map<number, string>(
    (geminiResult.segments ?? []).map((s) => [s.index, s.translatedText])
  );

  const processedSegments: ProcessedSegment[] = batch.map((seg, i) => {
    const wordMap = hardWordMap.get(i) ?? new Map();
    const words: ProcessedWord[] = seg.text.split(/(\s+)/).flatMap((token) => {
      if (/^\s+$/.test(token)) return [];
      const lower = token.replace(/[^\w]/g, '').toLowerCase();
      const hw = wordMap.get(lower) ?? wordMap.get(token.toLowerCase());
      if (hw) return [{ text: token, difficulty: hw.difficulty, translation: hw.translation }];
      return [{ text: token, difficulty: 1, translation: undefined }];
    });

    return {
      start: seg.start,
      duration: seg.duration,
      originalText: seg.text,
      translatedText: translationMap.get(i) ?? '',
      words,
    };
  });

  // Append remaining segments (beyond batch) without Gemini analysis
  for (let i = BATCH_SIZE; i < segments.length; i++) {
    const seg = segments[i];
    processedSegments.push({
      start: seg.start,
      duration: seg.duration,
      originalText: seg.text,
      translatedText: '',
      words: seg.text.split(/\s+/).map((w) => ({ text: w, difficulty: 1 })),
    });
  }

  return {
    overallDifficulty: geminiResult.overallDifficulty ?? 3,
    targetLanguage,
    segments: processedSegments,
  };
}

// ── extract video ID ───────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  }
  return null;
}

// ── route ─────────────────────────────────────────────────────────────────

router.post('/process', async (req: Request, res: Response) => {
  const { url, targetLanguage = 'English', nativeLanguage = 'English' } = req.body as {
    url: string;
    targetLanguage?: string;
    nativeLanguage?: string;
  };

  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    res.status(400).json({ error: 'Could not extract a valid YouTube video ID from that URL.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ step: 'fetching', videoId });
    const segments = await fetchYouTubeTranscript(videoId);
    send({ step: 'analyzing', count: segments.length });

    const analysis = await analyzeTranscript(segments, targetLanguage, nativeLanguage);
    send({ step: 'done', videoId, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.log()
    console.error('[video/process]', message);
    send({ step: 'error', error: message });
  } finally {
    res.end();
  }
});

export default router;
