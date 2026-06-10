"use client";
import { useState, useEffect } from "react";
import { db, getSettings } from "@/lib/db";
import type { Settings } from "@/lib/types";

const DEFAULT_SETTINGS: Settings = {
  ttsVoice: "",
  ttsSpeed: 1,
  timerEnabled: true,
  theme: "light",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    if (settings.id) {
      await db.settings.update(settings.id, updates);
    }
  };

  const toggleTheme = async () => {
    const next = settings.theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    await updateSettings({ theme: next });
  };

  return { settings, updateSettings, toggleTheme, loaded };
}
