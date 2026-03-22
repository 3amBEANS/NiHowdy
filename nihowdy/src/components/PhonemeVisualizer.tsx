import { useState } from 'react';

// ── types ─────────────────────────────────────────────────────────────────

export interface PronFeedback {
  word: string;
  ipa: string;
  tip: string;
  category: string;
}

interface PhonemeVisualizerProps {
  feedback: PronFeedback[];
  language: string;
}

// ── articulation config ───────────────────────────────────────────────────

interface ArticulationConfig {
  tonguePath: string;
  tongueColor: string;
  tongueFill: string;
  zoneName: string;
  lipShape: 'neutral' | 'spread' | 'rounded' | 'closed' | 'dental';
}

const ARTICULATION: Record<string, ArticulationConfig> = {
  'vowel-high-front': {
    tonguePath:
      'M 25,96 C 48,80 78,65 108,62 C 135,60 155,72 162,90 C 160,110 128,122 78,124 C 48,124 25,110 25,96 Z',
    tongueColor: '#818cf8',
    tongueFill: 'rgba(99,102,241,0.35)',
    zoneName: 'High Front Vowel',
    lipShape: 'spread',
  },
  'vowel-high-back': {
    tonguePath:
      'M 25,102 C 65,100 108,100 145,76 C 168,60 185,70 186,90 C 184,110 158,122 110,128 C 68,132 25,118 25,102 Z',
    tongueColor: '#818cf8',
    tongueFill: 'rgba(99,102,241,0.35)',
    zoneName: 'High Back Vowel',
    lipShape: 'rounded',
  },
  'vowel-mid': {
    tonguePath:
      'M 25,104 C 85,100 148,97 182,100 C 192,114 178,128 130,132 C 88,136 45,130 25,118 Z',
    tongueColor: '#818cf8',
    tongueFill: 'rgba(99,102,241,0.35)',
    zoneName: 'Mid Vowel',
    lipShape: 'neutral',
  },
  'vowel-low': {
    tonguePath:
      'M 25,114 C 85,118 150,116 184,113 C 194,128 178,138 128,142 C 85,145 45,138 25,128 Z',
    tongueColor: '#818cf8',
    tongueFill: 'rgba(99,102,241,0.35)',
    zoneName: 'Low Open Vowel',
    lipShape: 'neutral',
  },
  'consonant-bilabial': {
    tonguePath:
      'M 25,105 C 85,102 148,100 182,102 C 192,116 178,130 128,134 C 85,138 45,130 25,118 Z',
    tongueColor: '#f472b6',
    tongueFill: 'rgba(244,114,182,0.25)',
    zoneName: 'Bilabial Consonant',
    lipShape: 'closed',
  },
  'consonant-labiodental': {
    tonguePath:
      'M 25,106 C 85,103 148,101 182,103 C 192,117 178,130 128,134 C 85,138 45,130 25,118 Z',
    tongueColor: '#f472b6',
    tongueFill: 'rgba(244,114,182,0.25)',
    zoneName: 'Labiodental Consonant',
    lipShape: 'dental',
  },
  'consonant-dental': {
    tonguePath:
      'M 32,90 C 50,72 68,65 85,75 C 112,92 148,108 184,112 C 194,126 178,136 128,139 C 85,142 45,132 32,90 Z',
    tongueColor: '#fbbf24',
    tongueFill: 'rgba(251,191,36,0.25)',
    zoneName: 'Dental Consonant',
    lipShape: 'neutral',
  },
  'consonant-alveolar': {
    tonguePath:
      'M 32,86 C 50,70 68,60 90,74 C 115,92 148,110 185,114 C 194,128 178,138 128,141 C 85,144 45,134 32,86 Z',
    tongueColor: '#fbbf24',
    tongueFill: 'rgba(251,191,36,0.25)',
    zoneName: 'Alveolar Consonant',
    lipShape: 'neutral',
  },
  'consonant-postalveolar': {
    tonguePath:
      'M 35,88 C 58,68 85,56 112,72 C 138,88 162,108 188,114 C 196,128 178,138 128,141 C 85,144 45,135 35,88 Z',
    tongueColor: '#fbbf24',
    tongueFill: 'rgba(251,191,36,0.25)',
    zoneName: 'Post-alveolar Consonant',
    lipShape: 'neutral',
  },
  'consonant-palatal': {
    tonguePath:
      'M 25,100 C 65,90 105,68 138,64 C 162,62 180,76 182,96 C 180,115 150,126 98,130 C 60,132 25,118 25,100 Z',
    tongueColor: '#34d399',
    tongueFill: 'rgba(52,211,153,0.25)',
    zoneName: 'Palatal Consonant',
    lipShape: 'neutral',
  },
  'consonant-velar': {
    tonguePath:
      'M 25,106 C 78,112 122,108 158,78 C 178,62 194,70 192,90 C 190,112 162,124 114,130 C 72,134 25,122 25,106 Z',
    tongueColor: '#a78bfa',
    tongueFill: 'rgba(167,139,250,0.25)',
    zoneName: 'Velar Consonant',
    lipShape: 'neutral',
  },
  'consonant-rhotic': {
    tonguePath:
      'M 38,84 C 56,70 74,76 80,72 C 84,62 76,58 68,68 C 98,58 145,94 178,110 C 186,124 170,134 124,137 C 80,140 42,130 38,84 Z',
    tongueColor: '#fb923c',
    tongueFill: 'rgba(251,146,60,0.25)',
    zoneName: 'Rhotic / Tap',
    lipShape: 'neutral',
  },
  'consonant-lateral': {
    tonguePath:
      'M 32,86 C 52,70 70,60 90,74 C 115,92 148,110 185,114 C 194,128 178,138 128,141 C 85,144 45,134 32,86 Z',
    tongueColor: '#fbbf24',
    tongueFill: 'rgba(251,191,36,0.25)',
    zoneName: 'Lateral Consonant',
    lipShape: 'neutral',
  },
  'consonant-glottal': {
    tonguePath:
      'M 25,112 C 85,116 150,114 184,112 C 194,126 178,138 128,142 C 85,145 45,138 25,128 Z',
    tongueColor: '#38bdf8',
    tongueFill: 'rgba(56,189,248,0.25)',
    zoneName: 'Glottal Consonant',
    lipShape: 'neutral',
  },
};

const FALLBACK_CONFIG: ArticulationConfig = ARTICULATION['vowel-mid'];

// ── vowel chart data ──────────────────────────────────────────────────────

// [nx, ny] normalized: nx=0 front → 1 back; ny=0 high → 1 low
const VOWEL_MAP: Record<string, [number, number]> = {
  i: [0.0, 0.0], y: [0.06, 0.02], ɨ: [0.5, 0.0], ɯ: [1.0, 0.0], u: [0.94, 0.0],
  ɪ: [0.18, 0.13], ʏ: [0.22, 0.13], ʊ: [0.82, 0.13],
  e: [0.08, 0.33], ø: [0.15, 0.35], ɘ: [0.5, 0.33], ɵ: [0.5, 0.35], ɤ: [0.92, 0.33], o: [0.9, 0.33],
  ə: [0.5, 0.5], ɚ: [0.55, 0.5],
  ɛ: [0.18, 0.66], œ: [0.25, 0.68], ɜ: [0.5, 0.66], ɞ: [0.5, 0.68], ʌ: [0.78, 0.6], ɔ: [0.85, 0.66],
  æ: [0.12, 0.85], ɐ: [0.5, 0.85],
  a: [0.28, 1.0], ɶ: [0.3, 1.0], ä: [0.5, 1.0], ɑ: [1.0, 1.0], ɒ: [0.96, 1.0],
};

// Trapezoid chart: top wider (front–back axis), narrowing at bottom
// ViewBox 0 0 200 145
// Top-left (20,14), top-right (178,14), bottom-left (65,126), bottom-right (158,126)
function vowelToChartXY(nx: number, ny: number): [number, number] {
  const leftX = 20 + 45 * ny;          // 20 at top, 65 at bottom
  const rightX = 178 - 20 * ny;        // 178 at top, 158 at bottom
  const width = rightX - leftX;        // 158 at top, 93 at bottom
  const svgX = leftX + nx * width;
  const svgY = 14 + ny * 112;
  return [svgX, svgY];
}

function findVowelInIPA(ipa: string): { symbol: string; pos: [number, number] } | null {
  // Sort by length desc so digraph symbols (like ɛ) match before single chars
  const symbols = Object.keys(VOWEL_MAP);
  for (const ch of ipa) {
    if (VOWEL_MAP[ch]) return { symbol: ch, pos: VOWEL_MAP[ch] };
  }
  // fallback: search by multi-char
  for (const sym of symbols) {
    if (ipa.includes(sym)) return { symbol: sym, pos: VOWEL_MAP[sym] };
  }
  return null;
}

// ── sub-components ────────────────────────────────────────────────────────

function LipShape({ shape }: { shape: ArticulationConfig['lipShape'] }) {
  if (shape === 'closed') {
    return (
      <ellipse cx="8" cy="75" rx="6" ry="2" fill="#f9a8d4" opacity="0.9" />
    );
  }
  if (shape === 'rounded') {
    return (
      <ellipse cx="8" cy="75" rx="7" ry="7" fill="none" stroke="#f9a8d4" strokeWidth="1.8" />
    );
  }
  if (shape === 'spread') {
    return (
      <>
        <ellipse cx="8" cy="75" rx="6" ry="10" fill="none" stroke="#f9a8d4" strokeWidth="1.8" />
        {/* teeth hint */}
        <line x1="4" y1="71" x2="12" y2="71" stroke="#e8e8e0" strokeWidth="1" opacity="0.6" />
        <line x1="4" y1="79" x2="12" y2="79" stroke="#e8e8e0" strokeWidth="1" opacity="0.6" />
      </>
    );
  }
  if (shape === 'dental') {
    return (
      <>
        <ellipse cx="8" cy="75" rx="6" ry="9" fill="none" stroke="#f9a8d4" strokeWidth="1.8" />
        {/* upper teeth edge */}
        <line x1="4" y1="70" x2="12" y2="70" stroke="#e8e8e0" strokeWidth="2" opacity="0.7" />
      </>
    );
  }
  // neutral
  return (
    <ellipse cx="8" cy="75" rx="5.5" ry="9" fill="none" stroke="#f9a8d4" strokeWidth="1.8" />
  );
}

function MouthDiagram({ config }: { config: ArticulationConfig }) {
  return (
    <svg viewBox="0 0 220 145" className="w-full" aria-label="Mouth cross-section">
      <defs>
        <filter id="tongueGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="palatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b8956a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9d7d50" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={config.tongueColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={config.tongueColor} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* ── Static anatomy ───────────────────────────────── */}

      {/* Nasopharynx hint (dashed) */}
      <path
        d="M 158,30 Q 172,20 195,18"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.2"
        strokeDasharray="4,3"
        opacity="0.5"
      />

      {/* Upper palate (hard palate + velum) */}
      <path
        d="M 30,50 Q 62,35 100,24 Q 138,16 162,28 Q 182,44 188,68"
        fill="none"
        stroke="url(#palatGrad)"
        strokeWidth="2.2"
      />

      {/* Lower jaw */}
      <path
        d="M 18,108 Q 68,132 132,136 Q 170,136 188,118"
        fill="none"
        stroke="#9d7d50"
        strokeWidth="2.2"
        opacity="0.6"
      />

      {/* Upper teeth */}
      <rect x="28" y="50" width="28" height="13" rx="2.5"
        fill="#f0ede0" stroke="#ccc8a8" strokeWidth="0.8" opacity="0.85" />

      {/* Lower teeth */}
      <rect x="28" y="92" width="28" height="13" rx="2.5"
        fill="#f0ede0" stroke="#ccc8a8" strokeWidth="0.8" opacity="0.85" />

      {/* Alveolar ridge bump */}
      <path
        d="M 56,50 Q 64,36 60,50"
        fill="none"
        stroke="#b8956a"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Upper lip */}
      <path
        d="M 8,72 Q 5,54 18,50 Q 22,48 28,50"
        fill="none"
        stroke="#f9a8d4"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Lower lip */}
      <path
        d="M 8,80 Q 5,98 18,108 Q 22,110 28,108"
        fill="none"
        stroke="#f9a8d4"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Lip opening */}
      <LipShape shape={config.lipShape} />

      {/* ── Dynamic tongue ───────────────────────────────── */}
      <path
        d={config.tonguePath}
        fill={config.tongueFill}
        stroke={config.tongueColor}
        strokeWidth="1.8"
        filter="url(#tongueGlow)"
      />

      {/* ── Zone labels ──────────────────────────────────── */}
      <text x="41" y="47" fontSize="5.5" fill="#9ca3af" textAnchor="middle" opacity="0.7">Alv</text>
      <text x="108" y="20" fontSize="5.5" fill="#9ca3af" textAnchor="middle" opacity="0.7">Palate</text>
      <text x="166" y="26" fontSize="5.5" fill="#9ca3af" textAnchor="middle" opacity="0.7">Velum</text>
      <text x="196" y="26" fontSize="5" fill="#6b7280" textAnchor="middle" opacity="0.5">Nasal</text>

      {/* Throat label */}
      <text x="196" y="88" fontSize="5" fill="#6b7280" textAnchor="middle" opacity="0.5">Throat</text>
    </svg>
  );
}

function VowelChart({ ipa }: { ipa: string }) {
  const active = findVowelInIPA(ipa);
  const [activeXY] = active ? [vowelToChartXY(...active.pos)] : [null];

  // A selection of reference vowels to dot on the chart
  const refs: [string, number, number][] = [
    ['i', 0.0, 0.0], ['u', 0.94, 0.0],
    ['e', 0.08, 0.33], ['o', 0.9, 0.33],
    ['ə', 0.5, 0.5],
    ['ɛ', 0.18, 0.66], ['ɔ', 0.85, 0.66],
    ['a', 0.28, 1.0], ['ɑ', 1.0, 1.0],
    ['y', 0.06, 0.02], ['ø', 0.15, 0.35],
    ['æ', 0.12, 0.85], ['ʌ', 0.78, 0.6],
  ];

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-500 text-center">Vowel Space</p>
      <svg viewBox="0 0 200 145" className="w-full" aria-label="IPA vowel chart">
        <defs>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Chart background */}
        <rect x="10" y="5" width="182" height="133" rx="6" fill="rgba(17,24,39,0.5)" />

        {/* Trapezoid outline */}
        <polygon
          points="20,14 178,14 158,126 65,126"
          fill="none"
          stroke="#374151"
          strokeWidth="1.5"
        />

        {/* Horizontal grid lines at mid-high, mid, mid-low, near-low */}
        {[0.33, 0.5, 0.66, 0.85].map((ny) => {
          const [lx, ly] = vowelToChartXY(0, ny);
          const [rx] = vowelToChartXY(1, ny);
          return (
            <line
              key={ny}
              x1={lx} y1={ly} x2={rx} y2={ly}
              stroke="#374151"
              strokeWidth="0.7"
              strokeDasharray="3,2"
              opacity="0.6"
            />
          );
        })}

        {/* Axis labels */}
        <text x="20" y="10" fontSize="5.5" fill="#6b7280" textAnchor="middle">Front</text>
        <text x="100" y="10" fontSize="5.5" fill="#6b7280" textAnchor="middle">Central</text>
        <text x="178" y="10" fontSize="5.5" fill="#6b7280" textAnchor="middle">Back</text>
        <text x="8" y="16" fontSize="5" fill="#6b7280" textAnchor="end" transform="rotate(-90,8,62)">High</text>
        <text x="8" y="130" fontSize="5" fill="#6b7280" textAnchor="middle">Low</text>

        {/* Reference vowel dots */}
        {refs.map(([sym, nx, ny]) => {
          const [cx, cy] = vowelToChartXY(nx, ny);
          const isActive = active?.symbol === sym;
          return (
            <g key={sym}>
              {isActive && (
                <circle cx={cx} cy={cy} r="7" fill="#6366f1" opacity="0.25" filter="url(#dotGlow)" />
              )}
              <circle
                cx={cx} cy={cy} r={isActive ? 4.5 : 2.5}
                fill={isActive ? '#818cf8' : '#374151'}
                stroke={isActive ? '#c7d2fe' : 'none'}
                strokeWidth="1"
              />
              <text
                x={cx} y={cy - 6}
                fontSize={isActive ? '7' : '6'}
                fill={isActive ? '#c7d2fe' : '#6b7280'}
                textAnchor="middle"
                fontFamily="serif"
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {sym}
              </text>
            </g>
          );
        })}

        {/* If active vowel not in refs, draw it separately */}
        {active && !refs.find(([s]) => s === active.symbol) && (() => {
          const [cx, cy] = vowelToChartXY(...active.pos);
          return (
            <g>
              <circle cx={cx} cy={cy} r="7" fill="#6366f1" opacity="0.25" filter="url(#dotGlow)" />
              <circle cx={cx} cy={cy} r="4.5" fill="#818cf8" stroke="#c7d2fe" strokeWidth="1" />
              <text x={cx} y={cy - 6} fontSize="7" fill="#c7d2fe" textAnchor="middle" fontFamily="serif" fontWeight="bold">
                {active.symbol}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <circle cx="22" cy="139" r="3" fill="#818cf8" />
        <text x="27" y="142" fontSize="5.5" fill="#9ca3af">Target sound</text>
        <circle cx="80" cy="139" r="2.5" fill="#374151" />
        <text x="85" y="142" fontSize="5.5" fill="#6b7280">Reference vowels</text>
      </svg>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────

export function PhonemeVisualizer({ feedback, language: _language }: PhonemeVisualizerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!feedback.length) return null;

  const item = feedback[Math.min(activeIdx, feedback.length - 1)];
  const config = ARTICULATION[item.category] ?? FALLBACK_CONFIG;
  const isVowel = item.category.startsWith('vowel');

  return (
    <div className="rounded-2xl border border-indigo-900/40 bg-gray-950/80 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/60 bg-gray-900/60">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Accent Map
        </span>
        <span className="text-gray-700 text-xs">·</span>
        <span className="text-xs text-gray-500">mouth & phoneme visualizer</span>
      </div>

      {/* Word tabs */}
      {feedback.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3 flex-wrap">
          {feedback.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                i === activeIdx
                  ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                  : 'bg-gray-800/60 border border-gray-700/40 text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.word}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 flex flex-col gap-4">
        {/* Word + IPA */}
        <div className="flex items-baseline gap-3">
          <span className="text-orange-300 font-semibold text-lg">{item.word}</span>
          <span className="text-indigo-300 font-mono text-base tracking-wide">/{item.ipa}/</span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full border"
            style={{
              color: config.tongueColor,
              borderColor: config.tongueColor + '40',
              backgroundColor: config.tongueColor + '15',
            }}
          >
            {config.zoneName}
          </span>
        </div>

        {/* Diagrams */}
        <div className={`grid gap-4 ${isVowel ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500 text-center">Cross-section</p>
            <div className="bg-gray-900/60 rounded-xl p-2 border border-gray-800/50">
              <MouthDiagram config={config} />
            </div>
          </div>
          {isVowel && (
            <div className="bg-gray-900/60 rounded-xl p-2 border border-gray-800/50">
              <VowelChart ipa={item.ipa} />
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="flex gap-2.5 items-start bg-indigo-950/40 border border-indigo-900/30 rounded-xl px-3 py-2.5">
          <span className="text-indigo-400 text-base flex-shrink-0">💡</span>
          <p className="text-gray-300 text-xs leading-relaxed">{item.tip}</p>
        </div>
      </div>
    </div>
  );
}
