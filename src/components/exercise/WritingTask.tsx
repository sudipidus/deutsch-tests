"use client";
import type { WritingTask as WritingTaskType } from "@/lib/types";

interface Props {
  exercise: WritingTaskType;
  answer: string | Record<string, any>;
  onAnswerChange: (value: string) => void;
}

export function WritingTask({ exercise, answer, onAnswerChange }: Props) {
  const answerStr = typeof answer === "string" ? answer : "";
  const wordCount = answerStr.trim().split(/\s+/).filter((w) => w).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Task Prompt</h3>
          <p className="text-gray-700 dark:text-gray-300">{exercise.prompt}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Situation</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exercise.situation}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Content Points</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {exercise.contentPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium">Your Answer</label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {wordCount} words
          </span>
        </div>
        <textarea
          value={answerStr}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full h-64 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {wordCount < 80 && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Aim for at least 80 words (currently {wordCount})
        </p>
      )}
    </div>
  );
}
