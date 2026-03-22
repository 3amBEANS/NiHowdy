import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { BookOpen, Calendar, Video, User, Mic, Youtube } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { href: "/", label: "Study Plan", icon: Calendar },
  { href: "/weeklyPlan", label: "Weekly Plan", icon: Calendar },
  { href: "/materials", label: "Materials", icon: Video },
  { href: "/voice-chat", label: "Voice Chat", icon: Mic },
  { href: "/video", label: "Video", icon: Youtube },
];

const SETTINGS_KEY = "nihowdy.settings";

export default function Navigation() {
  const { pathname } = useLocation();
  const { user } = useAuth0();
  const [savedPhoto, setSavedPhoto] = useState("");

  useEffect(() => {
    const loadSavedPhoto = () => {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return setSavedPhoto("");
        const parsed = JSON.parse(raw) as { photoDataUrl?: string };
        setSavedPhoto(parsed.photoDataUrl ?? "");
      } catch {
        setSavedPhoto("");
      }
    };

    const onSettingsUpdated = () => loadSavedPhoto();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === SETTINGS_KEY) loadSavedPhoto();
    };

    loadSavedPhoto();
    window.addEventListener("nihowdy:settings-updated", onSettingsUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("nihowdy:settings-updated", onSettingsUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const avatarSrc = savedPhoto || user?.picture || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Nǐ Howdy</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            aria-label="Go to profile settings"
            title="Profile settings"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full bg-accent transition-colors",
              pathname === "/settings" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-accent-foreground" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}