"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { calculateTotalScore, isPassing } from "@/lib/scoring";
import type { Session } from "@/lib/types";

export default function SessionsPage() {
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

  const getScores = (session: Session) => {
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Your Sessions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all your practice and exam sessions</p>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No sessions yet.</p>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">
            Start a test →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const total = calculateTotalScore(getScores(session));
            const passing = isPassing(total);
            return (
              <Link
                key={session.id}
                href={`/test/${session.testId}/review?sessionId=${session.id}`}
                className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{session.testId}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(session.startedAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.status === "completed" && (
                      <p className="font-semibold text-lg">{total} / 180</p>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                        session.status === "completed"
                          ? passing
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {session.status === "completed" ? (passing ? "Passed" : "Failed") : "In Progress"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
