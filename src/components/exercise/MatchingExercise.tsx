"use client";
import { useState } from "react";
import type { MatchingExercise as MatchingExerciseType } from "@/lib/types";

interface Props {
  exercise: MatchingExerciseType;
  answers: Record<string, string>;
  onAnswerChange: (itemId: string, optionId: string) => void;
}

export function MatchingExercise({ exercise, answers, onAnswerChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Matching Exercise</h3>
        <p className="text-gray-700 dark:text-gray-300">{exercise.instructions}</p>
      </div>

      <div className="space-y-4">
        {exercise.items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <label className="block text-sm font-medium mb-3">{item.text}</label>
            <select
              value={answers[item.id] || ""}
              onChange={(e) => onAnswerChange(item.id, e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {exercise.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
