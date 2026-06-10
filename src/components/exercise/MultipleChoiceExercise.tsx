"use client";
import type { MultipleChoiceExercise as MCExerciseType } from "@/lib/types";

interface Props {
  exercise: MCExerciseType;
  answers: Record<number, string>;
  onAnswerChange: (questionIndex: number, optionKey: string) => void;
}

export function MultipleChoiceExercise({ exercise, answers, onAnswerChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{exercise.text}</p>
      </div>

      <div className="space-y-6">
        {exercise.questions.map((question, index) => (
          <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="font-medium mb-3">{question.prompt}</p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option.key}
                    checked={answers[index] === option.key}
                    onChange={() => onAnswerChange(index, option.key)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
