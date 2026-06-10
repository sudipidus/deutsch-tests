"use client";
import { useSettings } from "@/hooks/useSettings";

interface Props {
  formatted: string;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  showControls?: boolean;
}

export function TimerDisplay({
  formatted,
  isRunning,
  onStart,
  onPause,
  onReset,
  showControls = true,
}: Props) {
  const { settings } = useSettings();

  if (!settings?.timerEnabled) {
    return null;
  }

  const isUrgent = parseInt(formatted.split(":")[0]) < 5;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className={`text-3xl font-mono font-bold transition-colors ${
        isUrgent ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
      }`}>
        {formatted}
      </div>

      {showControls && (
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm font-medium transition-colors"
            >
              Start
            </button>
          ) : (
            <button
              onClick={onPause}
              className="rounded-md bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-sm font-medium transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={onReset}
            className="rounded-md bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
