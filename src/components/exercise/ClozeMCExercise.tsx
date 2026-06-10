"use client";
import type { ClozeMCExercise as ClozeExerciseType } from "@/lib/types";

interface Props {
  exercise: ClozeExerciseType;
  answers: Record<string, string>;
  onAnswerChange: (blankId: string, value: string) => void;
}

export function ClozeMCExercise({ exercise, answers, onAnswerChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {exercise.text.split("\n").map((paragraph, pIndex) => (
          <p key={pIndex} className="text-gray-700 dark:text-gray-300">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="space-y-4">
        {exercise.blanks.map((blank) => (
          <div key={blank.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <label className="block text-sm font-medium mb-3">Blank {blank.id}:</label>
            <select
              value={answers[blank.id] || ""}
              onChange={(e) => onAnswerChange(blank.id, e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {blank.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
