"use client";
import type { TrueFalseExercise as TFExerciseType } from "@/lib/types";

interface Props {
  exercise: TFExerciseType;
  answers: Record<number, boolean>;
  onAnswerChange: (questionIndex: number, value: boolean) => void;
}

export function TrueFalseExercise({ exercise, answers, onAnswerChange }: Props) {
  return (
    <div className="space-y-6">
      {exercise.dialogues.map((dialogue, dialogueIndex) => (
        <div key={dialogueIndex} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {dialogue.transcript}
          </div>

          <div className="space-y-3">
            {dialogue.questions.map((question, qIndex) => {
              const globalIndex = dialogueIndex * 10 + qIndex;
              return (
                <div key={qIndex} className="flex items-start gap-4 pt-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {question.prompt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAnswerChange(globalIndex, true)}
                      className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                        answers[globalIndex] === true
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      True
                    </button>
                    <button
                      onClick={() => onAnswerChange(globalIndex, false)}
                      className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                        answers[globalIndex] === false
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
