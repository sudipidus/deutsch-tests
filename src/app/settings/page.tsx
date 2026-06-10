"use client";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  if (!settings) {
    return <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your learning experience</p>
      </div>

      {/* Audio Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Audio</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Voice</label>
            <select
              value={settings.ttsVoice}
              onChange={(e) => updateSettings({ ...settings, ttsVoice: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="de-DE-Neural2-B">German (Female)</option>
              <option value="de-DE-Neural2-C">German (Male)</option>
              <option value="de-DE-Standard-A">German (Standard)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Choose your preferred German voice for listening exercises</p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Speed</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.ttsSpeed}
              onChange={(e) => updateSettings({ ...settings, ttsSpeed: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{settings.ttsSpeed.toFixed(1)}x speed</p>
          </div>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Exam</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.timerEnabled}
            onChange={(e) => updateSettings({ ...settings, timerEnabled: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Enable timer during practice</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">Show a 180-minute countdown timer during exercises</p>
      </div>

      {/* Theme Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>

        <div>
          <label className="block text-sm font-medium mb-3">Theme</label>
          <div className="flex gap-3">
            {["light", "dark"].map((theme) => (
              <label key={theme} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={settings.theme === theme}
                  onChange={(e) => updateSettings({ ...settings, theme: e.target.value as "light" | "dark" })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium capitalize">{theme} Mode</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 All settings are saved automatically to your device.
        </p>
      </div>
    </div>
  );
}
