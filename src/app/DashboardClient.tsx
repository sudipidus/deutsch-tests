"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { calculateTotalScore, isPassing } from "@/lib/scoring";
import type { Session } from "@/lib/types";

interface Props {
  tests: { id: string; title: string }[];
}

export function DashboardClient({ tests }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.sessions
      .orderBy("startedAt")
      .reverse()
      .toArray()
      .then((s) => {
        setSessions(s);
        setLoading(false);
      });
  }, []);

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const recentSessions = sessions.slice(0, 5);

  const getScores = (session: Session) => {
    const sec = session.sections;
    return {
      reading: {
        part1: sec.reading.part1.score,
        part2: sec.reading.part2.score,
        part3: sec.reading.part3.score,
      },
      sprachbausteine: {
        part1: sec.sprachbausteine.part1.score,
        part2: sec.sprachbausteine.part2.score,
      },
      listening: {
        part1: sec.listening.part1.score,
        part2: sec.listening.part2.score,
        part3: sec.listening.part3.score,
      },
    };
  };

  const bestScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => calculateTotalScore(getScores(s))))
      : 0;

  const passCount = completedSessions.filter((s) =>
    isPassing(calculateTotalScore(getScores(s)))
  ).length;

  const passRate =
    completedSessions.length > 0
      ? Math.round((passCount / completedSessions.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Practice for your telc Deutsch B1 exam
        </p>
      </div>

      {/* Available Tests */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Available Tests</h2>
        {tests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No mock tests found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <h3 className="font-medium text-blue-600 dark:text-blue-400">
                  {test.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  telc Deutsch B1
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Your Progress */}
      {completedSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tests Completed</p>
              <p className="text-2xl font-bold mt-1">{completedSessions.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Score</p>
              <p className="text-2xl font-bold mt-1">{bestScore} / 180</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p>
              <p className="text-2xl font-bold mt-1">{passRate}%</p>
            </div>
          </div>
        </section>
      )}

      {/* Recent Sessions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : recentSessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No sessions yet. Start a test above!</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => {
              const total = calculateTotalScore(getScores(session));
              const passing = isPassing(total);
              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-sm">
                      Test: {session.testId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(session.startedAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.status === "completed" && (
                      <span className="text-sm font-medium">
                        {total}/180
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.status === "completed"
                          ? passing
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {session.status === "completed"
                        ? passing
                          ? "Passed"
                          : "Failed"
                        : "In Progress"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
