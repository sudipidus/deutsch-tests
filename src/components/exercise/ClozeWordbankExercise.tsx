"use client";
import { useState } from "react";
import type { ClozeWordbankExercise as ClozeExerciseType } from "@/lib/types";

interface Props {
  exercise: ClozeExerciseType;
  answers: Record<string, string>;
  onAnswerChange: (blankId: string, value: string) => void;
}

export function ClozeWordbankExercise({ exercise, answers, onAnswerChange }: Props) {
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const handleChange = (blankId: string, value: string) => {
    const oldValue = answers[blankId];
    if (oldValue && oldValue !== value) {
      setUsedWords((prev) => {
        const next = new Set(prev);
        next.delete(oldValue);
        return next;
      });
    }
    if (value) {
      setUsedWords((prev) => new Set([...prev, value]));
    }
    onAnswerChange(blankId, value);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
        <p className="text-sm font-medium mb-2">Word Bank:</p>
        <div className="flex flex-wrap gap-2">
          {exercise.wordbank.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded text-sm font-medium transition-opacity ${
                usedWords.has(word)
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 opacity-50"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {exercise.text.split("\n").map((paragraph, pIndex) => (
          <p key={pIndex} className="text-gray-700 dark:text-gray-300">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(exercise.correctFills).map(([blankId, _]) => (
          <input
            key={blankId}
            type="text"
            placeholder={`Blank ${blankId}`}
            value={answers[blankId] || ""}
            onChange={(e) => handleChange(blankId, e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>
    </div>
  );
}
