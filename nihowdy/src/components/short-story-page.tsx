import { useEffect, useMemo, useState } from "react";
import { BookOpen, Languages, CheckCircle2 } from "lucide-react";

type SettingsData = {
  learningLanguage?: string;
};

type StoryPack = {
  title: string;
  level: string;
  story: string[];
  translation: string[];
  vocab: { term: string; meaning: string }[];
  question: string;
  answer: string;
};

const SETTINGS_KEY = "nihowdy.settings";

const STORIES: Record<string, StoryPack> = {
  Spanish: {
    title: "Un Día en el Mercado",
    level: "Beginner",
    story: [
      "Ana va al mercado por la mañana.",
      "Ella compra pan, leche y manzanas.",
      "Después, Ana regresa a casa y prepara el desayuno.",
    ],
    translation: [
      "Ana goes to the market in the morning.",
      "She buys bread, milk, and apples.",
      "After that, Ana returns home and makes breakfast.",
    ],
    vocab: [
      { term: "mercado", meaning: "market" },
      { term: "compra", meaning: "buys" },
      { term: "desayuno", meaning: "breakfast" },
    ],
    question: "¿Qué compra Ana en el mercado?",
    answer: "Pan, leche y manzanas.",
  },
  Mandarin: {
    title: "早上的公园",
    level: "Beginner",
    story: ["早上，小明去公园。", "他在公园跑步，然后喝水。", "最后，他回家吃早餐。"],
    translation: [
      "In the morning, Xiaoming goes to the park.",
      "He jogs in the park, then drinks water.",
      "Finally, he goes home and eats breakfast.",
    ],
    vocab: [
      { term: "公园", meaning: "park" },
      { term: "跑步", meaning: "jogging" },
      { term: "早餐", meaning: "breakfast" },
    ],
    question: "小明最后做什么？",
    answer: "他回家吃早餐。",
  },
  Chinese: {
    title: "早上的公园",
    level: "Beginner",
    story: ["早上，小明去公园。", "他在公园跑步，然后喝水。", "最后，他回家吃早餐。"],
    translation: [
      "In the morning, Xiaoming goes to the park.",
      "He jogs in the park, then drinks water.",
      "Finally, he goes home and eats breakfast.",
    ],
    vocab: [
      { term: "公园", meaning: "park" },
      { term: "跑步", meaning: "jogging" },
      { term: "早餐", meaning: "breakfast" },
    ],
    question: "小明最后做什么？",
    answer: "他回家吃早餐。",
  },
  Korean: {
    title: "아침 산책",
    level: "Beginner",
    story: ["지수는 아침에 공원에 갑니다.", "그녀는 걷고 물을 마십니다.", "집에 돌아와서 아침을 먹습니다."],
    translation: [
      "Jisoo goes to the park in the morning.",
      "She walks and drinks water.",
      "She returns home and eats breakfast.",
    ],
    vocab: [
      { term: "공원", meaning: "park" },
      { term: "걷다", meaning: "to walk" },
      { term: "아침", meaning: "morning/breakfast" },
    ],
    question: "지수는 집에 와서 무엇을 합니까?",
    answer: "아침을 먹습니다.",
  },
  Russian: {
    title: "Утро в парке",
    level: "Beginner",
    story: [
      "Иван идёт в парк утром.",
      "Он бегает и пьёт воду.",
      "Потом он возвращается домой и завтракает.",
    ],
    translation: [
      "Ivan goes to the park in the morning.",
      "He runs and drinks water.",
      "Then he returns home and has breakfast.",
    ],
    vocab: [
      { term: "парк", meaning: "park" },
      { term: "бегает", meaning: "runs" },
      { term: "завтракает", meaning: "has breakfast" },
    ],
    question: "Что Иван делает после парка?",
    answer: "Он возвращается домой и завтракает.",
  },
  English: {
    title: "Morning Routine",
    level: "Beginner",
    story: [
      "Mia wakes up at seven.",
      "She reads a short story for ten minutes.",
      "Then she writes three new words in her notebook.",
    ],
    translation: [
      "Mia wakes up at seven.",
      "She reads a short story for ten minutes.",
      "Then she writes three new words in her notebook.",
    ],
    vocab: [
      { term: "routine", meaning: "habitual set of actions" },
      { term: "notebook", meaning: "small book for notes" },
      { term: "short story", meaning: "brief narrative text" },
    ],
    question: "What does Mia write in her notebook?",
    answer: "Three new words.",
  },
};

export default function ShortStoryPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      setSettings(raw ? (JSON.parse(raw) as SettingsData) : {});
    } catch {
      setSettings({});
    }
  }, []);

  const preferredLanguage = settings.learningLanguage || "Spanish";
  const storyPack = useMemo(
    () => STORIES[preferredLanguage] ?? STORIES.Spanish,
    [preferredLanguage]
  );

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <BookOpen className="h-6 w-6 text-primary" />
          Short Story Study
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          Preferred language: <span className="font-medium">{preferredLanguage}</span>
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{storyPack.title}</h2>
          <span className="rounded-full border px-2 py-1 text-xs">{storyPack.level}</span>
        </div>

        <div className="space-y-2">
          {storyPack.story.map((line, i) => (
            <p key={`line-${i}`} className="text-foreground">
              {line}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className="mt-4 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </button>

        {showTranslation && (
          <div className="mt-3 space-y-2 rounded-md bg-accent/50 p-3 text-sm">
            {storyPack.translation.map((line, i) => (
              <p key={`tr-${i}`}>{line}</p>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-base font-semibold">Vocabulary Focus</h3>
        <ul className="space-y-2">
          {storyPack.vocab.map((v) => (
            <li key={v.term} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="font-medium">{v.term}</span>
              <span className="text-sm text-muted-foreground">{v.meaning}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h3 className="mb-2 text-base font-semibold">Comprehension Check</h3>
        <p className="text-sm">{storyPack.question}</p>
        <button
          type="button"
          onClick={() => setShowAnswer((v) => !v)}
          className="mt-3 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          {showAnswer ? "Hide answer" : "Reveal answer"}
        </button>
        {showAnswer && (
          <p className="mt-3 flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {storyPack.answer}
          </p>
        )}
      </section>
    </main>
  );
}