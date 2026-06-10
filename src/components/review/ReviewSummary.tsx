"use client";
import Link from "next/link";
import type { Session } from "@/lib/types";

interface Props {
  session: Session;
  testTitle: string;
}

export function ReviewSummary({ session, testTitle }: Props) {
  const completionTime = session.completedAt
    ? new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()
    : 0;
  const minutes = Math.floor(completionTime / 1000 / 60);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div>
        <h3 className="text-lg font-semibold">Session Summary</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{testTitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed At</p>
          <p className="text-sm font-medium mt-1">
            {session.completedAt
              ? new Date(session.completedAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Time Spent</p>
          <p className="text-sm font-medium mt-1">{minutes} minutes</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mode</p>
          <p className="text-sm font-medium mt-1 capitalize">{session.mode}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Link
          href="/"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-2 px-4 text-center text-sm transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
