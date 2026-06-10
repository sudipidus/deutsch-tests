import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { Session, SectionBlock } from "@/lib/types";

export function useSession(testId: string, mode: "exam" | "practice" = "practice") {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const newSession: Session = {
        testId,
        mode,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        completedAt: null,
        status: "in-progress",
        sections: {
          reading: {
            part1: { answers: {}, score: null, completedAt: null },
            part2: { answers: {}, score: null, completedAt: null },
            part3: { answers: {}, score: null, completedAt: null },
          },
          sprachbausteine: {
            part1: { answers: {}, score: null, completedAt: null },
            part2: { answers: {}, score: null, completedAt: null },
          },
          listening: {
            part1: { answers: {}, score: null, completedAt: null },
            part2: { answers: {}, score: null, completedAt: null },
            part3: { answers: {}, score: null, completedAt: null },
          },
          writing: {
            task: { answers: "", score: null, completedAt: null },
          },
          speaking: {
            part1: { answers: { notes: "", selfAssessment: {} }, score: null, completedAt: null },
            part2: { answers: { notes: "", selfAssessment: {} }, score: null, completedAt: null },
            part3: { answers: { notes: "", selfAssessment: {} }, score: null, completedAt: null },
          },
        },
        timeSpent: {
          "reading-sprachbausteine": 0,
          listening: 0,
          writing: 0,
          speaking: 0,
        },
      };

      const sessionId = await db.sessions.add(newSession as any);
      setSession({ ...newSession, id: sessionId });
      setLoading(false);
    };

    initSession();
  }, [testId, mode]);

  const updateSession = async (updates: Partial<Session>) => {
    if (!session?.id) return;

    const updatedSession = {
      ...session,
      ...updates,
      lastActivityAt: new Date(),
    };

    setSession(updatedSession);
    await db.sessions.update(session.id, updatedSession as any);
  };

  return {
    session,
    loading,
    updateSession,
  };
}
