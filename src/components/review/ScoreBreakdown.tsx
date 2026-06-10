"use client";
import type { Session } from "@/lib/types";
import { calculateTotalScore, isPassing } from "@/lib/scoring";

interface Props {
  session: Session;
}

export function ScoreBreakdown({ session }: Props) {
  const getScores = () => {
    const sec = session.sections;
    return {
      reading: {
        part1: sec.reading.part1.score ?? 0,
        part2: sec.reading.part2.score ?? 0,
        part3: sec.reading.part3.score ?? 0,
      },
      sprachbausteine: {
        part1: sec.sprachbausteine.part1.score ?? 0,
        part2: sec.sprachbausteine.part2.score ?? 0,
      },
      listening: {
        part1: sec.listening.part1.score ?? 0,
        part2: sec.listening.part2.score ?? 0,
        part3: sec.listening.part3.score ?? 0,
      },
    };
  };

  const scores = getScores();
  const totalScore = calculateTotalScore(scores);
  const passing = isPassing(totalScore);

  const sectionScores = [
    { name: "Reading", score: Object.values(scores.reading).reduce((a, b) => a + b, 0), max: 60 },
    { name: "Sprachbausteine", score: Object.values(scores.sprachbausteine).reduce((a, b) => a + b, 0), max: 30 },
    { name: "Listening", score: Object.values(scores.listening).reduce((a, b) => a + b, 0), max: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Total Score */}
      <div className={`rounded-xl border-2 p-6 text-center ${
        passing
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
          : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      }`}>
        <p className={`text-sm font-medium ${passing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {passing ? "PASSED" : "NOT PASSED"}
        </p>
        <p className="text-4xl font-bold mt-2">{totalScore} / 180</p>
        <p className={`text-sm mt-2 ${passing ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
          {passing ? "Congratulations! You passed the exam." : "You need 120 points to pass."}
        </p>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Breakdown by Section</h3>
        {sectionScores.map((section) => (
          <div key={section.name} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{section.name}</span>
              <span className="text-sm font-semibold">{section.score} / {section.max}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(section.score / section.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      {!passing && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">💡 Tips for next time:</p>
          <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-1">
            <li>Review weak sections more thoroughly</li>
            <li>Practice time management during the exam</li>
            <li>Use the review to identify patterns in mistakes</li>
          </ul>
        </div>
      )}
    </div>
  );
}
