import { getTestById, getAllTestIds } from "@/lib/tests";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScoreBreakdown } from "@/components/review/ScoreBreakdown";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import type { Session } from "@/lib/types";

export async function generateStaticParams() {
  const testIds = getAllTestIds();
  return testIds.map((id) => ({ id }));
}

interface Props {
  params: { id: string };
  searchParams: { sessionId?: string };
}

export default async function ReviewPage({ params, searchParams }: Props) {
  let test;
  try {
    test = getTestById(params.id);
  } catch {
    notFound();
  }

  let session: Session | null = null;

  // Try to load the most recent completed session for this test
  if (searchParams.sessionId) {
    const sessionId = parseInt(searchParams.sessionId);
    session = (await db.sessions.get(sessionId)) || null;
  } else {
    const sessions = await db.sessions
      .where("testId")
      .equals(params.id)
      .filter((s) => s.status === "completed")
      .toArray();
    session = sessions[sessions.length - 1] || null;
  }

  if (!session) {
    notFound();
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
