import { useMemo, useState } from "react";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctIndex: 2,
  },
  {
    id: "q2",
    prompt: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
  },
  {
    id: "q3",
    prompt: "2 + 2 equals?",
    options: ["3", "4", "5", "6"],
    correctIndex: 1,
  },
];

export default function TestPage() {
  const questions = SAMPLE_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [submitted, setSubmitted] = useState(false);

  const current = questions[currentIndex];
  const selected = answers[current.id];

  const progress = useMemo(() => {
    const answeredCount = Object.values(answers).filter((v) => v !== null).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answers, questions.length]);

  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      return answers[q.id] === q.correctIndex ? acc + 1 : acc;
    }, 0);
  }, [answers, questions]);

  const setAnswer = (optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  const submitTest = () => setSubmitted(true);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Assessment Test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer all questions, then submit.
        </p>
      </header>

      <section className="mb-6 rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-medium">{current.prompt}</h2>

        <div className="mt-4 grid gap-3">
          {current.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            const isCorrect = optionIndex === current.correctIndex;
            const showCorrect = submitted && isCorrect;
            const showWrong = submitted && isSelected && !isCorrect;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer(optionIndex)}
                className={[
                  "w-full rounded-md border px-4 py-3 text-left transition",
                  isSelected ? "border-primary" : "border-border",
                  showCorrect ? "bg-green-100 border-green-500" : "",
                  showWrong ? "bg-red-100 border-red-500" : "",
                  submitted ? "cursor-default" : "hover:bg-accent",
                ].join(" ")}
                disabled={submitted}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-md border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="text-sm text-muted-foreground">
            {Object.values(answers).filter((v) => v !== null).length} answered
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="rounded-md border px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      <section className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={submitTest}
          disabled={submitted}
          className="rounded-md bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50"
        >
          {submitted ? "Submitted" : "Submit Test"}
        </button>

        {submitted && (
          <p className="text-sm font-medium">
            Score: {score} / {questions.length}
          </p>
        )}
      </section>
    </main>
  );
}