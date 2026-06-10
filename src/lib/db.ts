import Dexie, { type EntityTable } from "dexie";
import type { Session, Note, Settings } from "./types";

const db = new Dexie("B1PracticeApp") as Dexie & {
  sessions: EntityTable<Session, "id">;
  notes: EntityTable<Note, "id">;
  settings: EntityTable<Settings, "id">;
};

db.version(1).stores({
  sessions: "++id, testId, status, startedAt",
  notes: "++id, sessionId, testId, section, *tags, createdAt",
  settings: "++id",
});

export { db };

export function createEmptySession(testId: string, mode: "exam" | "practice"): Omit<Session, "id"> {
  const emptyMatching = { answers: {}, score: null, completedAt: null };
  const emptyMC = { answers: {}, score: null, completedAt: null };
  const emptyTF = { answers: {}, score: null, completedAt: null };
  const emptyWriting = { answers: "", score: null, completedAt: null };
  const emptySpeaking = {
    answers: { notes: "", selfAssessment: {} },
    score: null,
    completedAt: null,
  };

  return {
    testId,
    mode,
    startedAt: new Date(),
    lastActivityAt: new Date(),
    completedAt: null,
    status: "in-progress",
    sections: {
      reading: { part1: emptyMatching, part2: emptyMC, part3: emptyMatching },
      sprachbausteine: { part1: emptyMatching, part2: emptyMatching },
      listening: { part1: emptyTF, part2: emptyTF, part3: emptyMatching },
      writing: { task: emptyWriting },
      speaking: { part1: emptySpeaking, part2: emptySpeaking, part3: emptySpeaking },
    },
    timeSpent: {
      "reading-sprachbausteine": 0,
      listening: 0,
      writing: 0,
      speaking: 0,
    },
  };
}

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  const defaults: Settings = {
    ttsVoice: "",
    ttsSpeed: 1,
    timerEnabled: true,
    theme: "light",
  };
  const id = await db.settings.add(defaults);
  return { ...defaults, id: id as number };
}
