import { useEffect, useState } from "react";

type SettingsData = {
  displayName: string;
  nativeLanguage: string;
  learningLanguage: string;
  studyStart: string;
  studyEnd: string;
  dailyGoalMinutes: number;
  photoDataUrl: string;
  studyDays: string[];
};

const STORAGE_KEY = "nihowdy.settings";

const LANGUAGE_OPTIONS = ["Chinese", "Spanish", "Russian", "Korean", "English"] as const;
const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const defaultSettings: SettingsData = {
  displayName: "",
  nativeLanguage: "English",
  learningLanguage: "Spanish",
  studyStart: "18:00",
  studyEnd: "19:00",
  dailyGoalMinutes: 30,
  photoDataUrl: "",
  studyDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const toggleStudyDay = (day: string) => {
    setSettings((prev) => {
      const exists = prev.studyDays.includes(day);
      return {
        ...prev,
        studyDays: exists
          ? prev.studyDays.filter((d) => d !== day)
          : [...prev.studyDays, day],
      };
    });
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SettingsData;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      // ignore bad localStorage data
    }
  }, []);

  const onChange =
    <K extends keyof SettingsData>(key: K) =>
    (value: SettingsData[K]) =>
      setSettings((prev) => ({ ...prev, [key]: value }));

  const handlePhotoFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange("photoDataUrl")(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("nihowdy:settings-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and study preferences.
        </p>
      </header>

      <div className="space-y-6 rounded-xl border bg-card p-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Profile
          </h2>

          <div className="mb-4 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border bg-muted">
              {settings.photoDataUrl ? (
                <img
                  src={settings.photoDataUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No photo
                </div>
              )}
            </div>

            <label className="cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-accent">
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Display name</span>
            <input
              value={settings.displayName}
              onChange={(e) => onChange("displayName")(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Languages
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Native language</span>
              <select
                value={settings.nativeLanguage}
                onChange={(e) => onChange("nativeLanguage")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Learning language</span>
              <select
                value={settings.learningLanguage}
                onChange={(e) => onChange("learningLanguage")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Study Plan
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Start time</span>
              <input
                type="time"
                value={settings.studyStart}
                onChange={(e) => onChange("studyStart")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">End time</span>
              <input
                type="time"
                value={settings.studyEnd}
                onChange={(e) => onChange("studyEnd")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Daily goal (min)</span>
              <input
                type="number"
                min={5}
                step={5}
                value={settings.dailyGoalMinutes}
                onChange={(e) => onChange("dailyGoalMinutes")(Number(e.target.value || 0))}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm text-muted-foreground">Study days</span>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const selected = settings.studyDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleStudyDay(day)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                        : "rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                    }
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Save settings
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
        </div>
      </div>
    </main>
  );
}