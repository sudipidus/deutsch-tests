"use client";
import { useState } from "react";
import type { SpeakingTask as SpeakingTaskType, SpeakingAnswer } from "@/lib/types";

interface Props {
  exercise: SpeakingTaskType;
  answer: SpeakingAnswer;
  onAnswerChange: (answer: SpeakingAnswer) => void;
}

export function SpeakingTask({ exercise, answer, onAnswerChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Instructions</h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm whitespace-pre-wrap">
          {exercise.instructions}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Prompts to Address</h3>
        {exercise.prompts.map((prompt, index) => (
          <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm font-medium mb-2">Point {index + 1}:</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{prompt}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block font-medium mb-3">Your Notes</label>
        <textarea
          value={answer.notes}
          onChange={(e) =>
            onAnswerChange({
              ...answer,
              notes: e.target.value,
            })
          }
          placeholder="Take notes about your response..."
          className="w-full h-32 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Self-Assessment Checklist</h3>
        <div className="space-y-2">
          {exercise.checklist.map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={answer.selfAssessment[index] || false}
                onChange={(e) => {
                  const newAssessment = { ...answer.selfAssessment };
                  newAssessment[index] = e.target.checked;
                  onAnswerChange({
                    ...answer,
                    selfAssessment: newAssessment,
                  });
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
