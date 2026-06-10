"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScoreBreakdown } from "@/components/review/ScoreBreakdown";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import type { Session, MockTest } from "@/lib/types";

interface Props {
  test: MockTest;
  testId: string;
}

export function ReviewClient({ test, testId }: Props) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const sessionId = searchParams.get("sessionId");
      let s: Session | null = null;

      if (sessionId) {
        s = (await db.sessions.get(parseInt(sessionId))) || null;
      } else {
        const sessions = await db.sessions
          .where("testId")
          .equals(testId)
          .filter((s) => s.status === "completed")
          .toArray();
        s = sessions[sessions.length - 1] || null;
      }

      setSession(s);
      setLoading(false);
    };

    loadSession();
  }, [testId, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No completed session found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Review Results</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{test.title} • Level {test.level}</p>
      </div>

      {/* Score Breakdown */}
      <ScoreBreakdown session={session} />

      {/* Summary */}
      <ReviewSummary session={session} testTitle={test.title} />
    </div>
  );
}
