# telc Deutsch B1 Practice App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Next.js web app for practicing telc Deutsch B1 exams with all 5 sections, local storage, notes, and session tracking.

**Architecture:** Next.js 15 App Router with static export. Content as JSON files read at build time. IndexedDB (Dexie.js) for sessions/notes/settings. Exercise components per question type rendered by a dynamic route.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Dexie.js, @hello-pangea/dnd

**Spec:** `docs/superpowers/specs/2026-06-10-b1-practice-app-design.md`

---

## File Structure

```
b1/
├── content/tests/
│   ├── test-01.json
│   ├── test-02.json
│   └── test-03.json
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout, ThemeProvider, Nav
│   │   ├── page.tsx                            # Dashboard
│   │   ├── test/
│   │   │   └── [id]/
│   │   │       ├── page.tsx                    # Test overview (section cards)
│   │   │       └── [section]/
│   │   │           └── [part]/
│   │   │               └── page.tsx            # Exercise view
│   │   ├── results/
│   │   │   └── page.tsx                        # Results page (reads sessionId from query params)
│   │   ├── sessions/
│   │   │   └── page.tsx                        # Session history
│   │   ├── notes/
│   │   │   └── page.tsx                        # Notes manager
│   │   └── settings/
│   │       └── page.tsx                        # Settings + export/import
│   ├── components/
│   │   ├── exercises/
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── Matching.tsx
│   │   │   ├── TrueFalse.tsx
│   │   │   ├── ClozeDropdown.tsx
│   │   │   ├── ClozeWordbank.tsx
│   │   │   ├── WritingTask.tsx
│   │   │   ├── SpeakingTask.tsx
│   │   │   └── ListeningPlayer.tsx
│   │   ├── review/
│   │   │   ├── ScoreSummary.tsx
│   │   │   ├── MatchingReview.tsx
│   │   │   ├── MultipleChoiceReview.tsx
│   │   │   ├── TrueFalseReview.tsx
│   │   │   ├── ClozeReview.tsx
│   │   │   ├── WritingReview.tsx
│   │   │   └── SpeakingReview.tsx
│   │   └── layout/
│   │       ├── Nav.tsx
│   │       ├── Timer.tsx
│   │       ├── NotesPanel.tsx
│   │       └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── types.ts                            # All TypeScript interfaces
│   │   ├── db.ts                               # Dexie.js database setup
│   │   ├── scoring.ts                          # Score calculation functions
│   │   ├── tts.ts                              # Web Speech API wrapper
│   │   ├── tests.ts                            # Test loading utilities
│   │   └── constants.ts                        # Timer durations, scoring weights
│   └── hooks/
│       ├── useSession.ts                       # Session CRUD & auto-save
│       ├── useTimer.ts                         # Countdown timer
│       ├── useNotes.ts                         # Notes CRUD
│       └── useSettings.ts                      # Settings read/write (includes theme)
├── __tests__/
│   ├── lib/
│   │   ├── scoring.test.ts
│   │   └── tts.test.ts
│   └── hooks/
│       └── useTimer.test.ts
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── jest.config.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`, `jest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/sudipbhandari/projects/b1
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Accept overwriting existing files if prompted.

- [ ] **Step 2: Install dependencies**

```bash
npm install dexie @hello-pangea/dnd
npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest jest-environment-jsdom
```

- [ ] **Step 3: Configure Jest**

Create `jest.config.ts`:
```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:
```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Configure Next.js for static export**

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts on localhost:3000

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js project with Tailwind, Dexie, Jest"
```

---

## Task 2: TypeScript Types & Constants

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Create types file**

Create `src/lib/types.ts` with all interfaces from the spec:
```typescript
// --- Content types (match JSON structure) ---

export interface MockTest {
  id: string;
  title: string;
  level: "B1";
  reading: {
    part1: MatchingExercise;
    part2: MultipleChoiceExercise;
    part3: MatchingExercise;
  };
  sprachbausteine: {
    part1: ClozeMCExercise;
    part2: ClozeWordbankExercise;
  };
  listening: {
    part1: TrueFalseExercise;
    part2: TrueFalseExercise;
    part3: MatchingExercise;
  };
  writing: {
    task: WritingTask;
  };
  speaking: {
    part1: SpeakingTask;
    part2: SpeakingTask;
    part3: SpeakingTask;
  };
}

export interface MatchingExercise {
  type: "matching";
  instructions: string;
  items: { id: string; text: string }[];
  options: { id: string; text: string }[];
  correctMatches: Record<string, string>;
}

export interface MultipleChoiceExercise {
  type: "multiple-choice";
  text: string;
  questions: {
    prompt: string;
    options: { key: string; text: string }[];
    correct: string;
  }[];
}

export interface TrueFalseExercise {
  type: "true-false";
  dialogues: {
    transcript: string;
    questions: {
      prompt: string;
      correct: boolean;
    }[];
  }[];
}

export interface ClozeMCExercise {
  type: "cloze-mc";
  text: string;
  blanks: {
    id: string;
    options: string[];
    correct: string;
  }[];
}

export interface ClozeWordbankExercise {
  type: "cloze-wordbank";
  text: string;
  wordbank: string[];
  correctFills: Record<string, string>;
}

export interface WritingTask {
  prompt: string;
  situation: string;
  contentPoints: string[];
  modelAnswer: string;
}

export interface SpeakingTask {
  instructions: string;
  prompts: string[];
  modelAnswer: string;
  checklist: string[];
}

// --- Session types (IndexedDB) ---

export type SectionBlock = "reading-sprachbausteine" | "listening" | "writing" | "speaking";

export interface SectionPartState<T> {
  answers: T;
  score: number | null;
  completedAt: Date | null;
}

export interface SpeakingAnswer {
  notes: string;
  selfAssessment: Record<string, boolean>;
}

export interface Session {
  id?: number;
  testId: string;
  mode: "exam" | "practice";
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
  status: "in-progress" | "completed";
  sections: SessionSections;
  timeSpent: Record<SectionBlock, number>;
}

export interface SessionSections {
  reading: {
    part1: SectionPartState<Record<string, string>>;
    part2: SectionPartState<Record<number, string>>;
    part3: SectionPartState<Record<string, string>>;
  };
  sprachbausteine: {
    part1: SectionPartState<Record<string, string>>;
    part2: SectionPartState<Record<string, string>>;
  };
  listening: {
    part1: SectionPartState<Record<number, boolean>>;
    part2: SectionPartState<Record<number, boolean>>;
    part3: SectionPartState<Record<string, string>>;
  };
  writing: {
    task: SectionPartState<string>;
  };
  speaking: {
    part1: SectionPartState<SpeakingAnswer>;
    part2: SectionPartState<SpeakingAnswer>;
    part3: SectionPartState<SpeakingAnswer>;
  };
}

export interface Note {
  id?: number;
  sessionId: number | null;
  testId: string | null;
  section: string | null;
  part: string | null;
  questionIndex: number | null;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id?: number;
  ttsVoice: string;
  ttsSpeed: number;
  timerEnabled: boolean;
  theme: "light" | "dark";
}

export type ExerciseType =
  | MatchingExercise
  | MultipleChoiceExercise
  | TrueFalseExercise
  | ClozeMCExercise
  | ClozeWordbankExercise
  | WritingTask
  | SpeakingTask;
```

- [ ] **Step 2: Create constants file**

Create `src/lib/constants.ts`:
```typescript
import { SectionBlock } from "./types";

export const TIMER_DURATIONS: Record<SectionBlock, number | null> = {
  "reading-sprachbausteine": 90 * 60,
  listening: 30 * 60,
  writing: 30 * 60,
  speaking: null, // untimed
};

export const SECTION_BLOCK_MAP: Record<string, SectionBlock> = {
  reading: "reading-sprachbausteine",
  sprachbausteine: "reading-sprachbausteine",
  listening: "listening",
  writing: "writing",
  speaking: "speaking",
};

export const SCORING_WEIGHTS = {
  reading: { part1: { total: 25, count: 5 }, part2: { total: 25, count: 5 }, part3: { total: 25, count: 10 } },
  sprachbausteine: { part1: { total: 15, count: 10 }, part2: { total: 15, count: 10 } },
  listening: { part1: { total: 25, count: 5 }, part2: { total: 25, count: 10 }, part3: { total: 25, count: 5 } },
} as const;

export const PASS_THRESHOLD = 0.6;
export const MAX_SCORED_POINTS = 180;

export const EXAM_SECTION_ORDER: SectionBlock[] = [
  "reading-sprachbausteine",
  "listening",
  "writing",
  "speaking",
];

export const SECTIONS_IN_BLOCK: Record<SectionBlock, string[]> = {
  "reading-sprachbausteine": ["reading", "sprachbausteine"],
  listening: ["listening"],
  writing: ["writing"],
  speaking: ["speaking"],
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts && git commit -m "feat: add TypeScript types and constants"
```

---

## Task 3: Database Layer

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create Dexie database**

Create `src/lib/db.ts`:
```typescript
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
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts && git commit -m "feat: add Dexie.js database layer"
```

---

## Task 4: Scoring Logic with Tests

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `__tests__/lib/scoring.test.ts`

- [ ] **Step 1: Write scoring tests**

Create `__tests__/lib/scoring.test.ts`:
```typescript
import {
  scoreMatchingPart,
  scoreMultipleChoicePart,
  scoreTrueFalsePart,
  scoreClozePart,
  calculateTotalScore,
} from "@/lib/scoring";

describe("scoreMatchingPart", () => {
  it("scores correct matches", () => {
    const correct = { a: "1", b: "2", c: "3" };
    const answers = { a: "1", b: "2", c: "3" };
    expect(scoreMatchingPart(answers, correct, 25, 3)).toBe(25);
  });

  it("scores partial matches", () => {
    const correct = { a: "1", b: "2", c: "3" };
    const answers = { a: "1", b: "X", c: "3" };
    expect(scoreMatchingPart(answers, correct, 25, 3)).toBeCloseTo(16.67, 1);
  });

  it("scores zero for all wrong", () => {
    const correct = { a: "1", b: "2" };
    const answers = { a: "X", b: "Y" };
    expect(scoreMatchingPart(answers, correct, 25, 2)).toBe(0);
  });

  it("handles unanswered items", () => {
    const correct = { a: "1", b: "2", c: "3" };
    const answers = { a: "1" };
    expect(scoreMatchingPart(answers, correct, 25, 3)).toBeCloseTo(8.33, 1);
  });
});

describe("scoreMultipleChoicePart", () => {
  it("scores correct answers", () => {
    const correct = ["a", "b", "c"];
    const answers: Record<number, string> = { 0: "a", 1: "b", 2: "c" };
    expect(scoreMultipleChoicePart(answers, correct, 25)).toBe(25);
  });

  it("handles missing answers as wrong", () => {
    const correct = ["a", "b", "c"];
    const answers: Record<number, string> = { 0: "a" };
    expect(scoreMultipleChoicePart(answers, correct, 25)).toBeCloseTo(8.33, 1);
  });
});

describe("scoreTrueFalsePart", () => {
  it("scores boolean answers", () => {
    const correct = [true, false, true];
    const answers: Record<number, boolean> = { 0: true, 1: false, 2: true };
    expect(scoreTrueFalsePart(answers, correct, 25)).toBe(25);
  });
});

describe("scoreClozePart", () => {
  it("scores cloze answers", () => {
    const correct: Record<string, string> = { "1": "weil", "2": "gestern" };
    const answers: Record<string, string> = { "1": "weil", "2": "morgen" };
    expect(scoreClozePart(answers, correct, 15)).toBe(7.5);
  });
});

describe("calculateTotalScore", () => {
  it("sums all section scores", () => {
    const scores = {
      reading: { part1: 25, part2: 20, part3: 15 },
      sprachbausteine: { part1: 10, part2: 12 },
      listening: { part1: 25, part2: 20, part3: 25 },
    };
    expect(calculateTotalScore(scores)).toBe(152);
  });

  it("treats null as 0", () => {
    const scores = {
      reading: { part1: 25, part2: null, part3: null },
      sprachbausteine: { part1: null, part2: null },
      listening: { part1: null, part2: null, part3: null },
    };
    expect(calculateTotalScore(scores)).toBe(25);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/scoring.test.ts
```
Expected: FAIL — modules not found

- [ ] **Step 3: Implement scoring**

Create `src/lib/scoring.ts`:
```typescript
export function scoreMatchingPart(
  answers: Record<string, string>,
  correct: Record<string, string>,
  totalPoints: number,
  itemCount: number
): number {
  let correctCount = 0;
  for (const key of Object.keys(correct)) {
    if (answers[key] === correct[key]) correctCount++;
  }
  return (correctCount / itemCount) * totalPoints;
}

export function scoreMultipleChoicePart(
  answers: Record<number, string>,
  correctKeys: string[],
  totalPoints: number
): number {
  let correctCount = 0;
  for (let i = 0; i < correctKeys.length; i++) {
    if (answers[i] === correctKeys[i]) correctCount++;
  }
  return (correctCount / correctKeys.length) * totalPoints;
}

export function scoreTrueFalsePart(
  answers: Record<number, boolean>,
  correctValues: boolean[],
  totalPoints: number
): number {
  let correctCount = 0;
  for (let i = 0; i < correctValues.length; i++) {
    if (answers[i] === correctValues[i]) correctCount++;
  }
  return (correctCount / correctValues.length) * totalPoints;
}

export function scoreClozePart(
  answers: Record<string, string>,
  correct: Record<string, string>,
  totalPoints: number
): number {
  const keys = Object.keys(correct);
  let correctCount = 0;
  for (const key of keys) {
    if (answers[key] === correct[key]) correctCount++;
  }
  return (correctCount / keys.length) * totalPoints;
}

export type SectionScores = {
  reading: { part1: number | null; part2: number | null; part3: number | null };
  sprachbausteine: { part1: number | null; part2: number | null };
  listening: { part1: number | null; part2: number | null; part3: number | null };
};

export function calculateTotalScore(scores: SectionScores): number {
  let total = 0;
  for (const section of Object.values(scores)) {
    for (const partScore of Object.values(section)) {
      total += partScore ?? 0;
    }
  }
  return total;
}

export function isPassing(totalScore: number): boolean {
  return totalScore >= 108; // 60% of 180
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/lib/scoring.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts __tests__/lib/scoring.test.ts && git commit -m "feat: add scoring logic with tests"
```

---

## Task 5: TTS Wrapper

**Files:**
- Create: `src/lib/tts.ts`

- [ ] **Step 1: Create TTS wrapper**

Create `src/lib/tts.ts`:
```typescript
export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getGermanVoices(): SpeechSynthesisVoice[] {
  if (!isTTSAvailable()) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith("de"));
}

export function speak(
  text: string,
  options?: { voice?: string; rate?: number; onEnd?: () => void }
): SpeechSynthesisUtterance | null {
  if (!isTTSAvailable()) return null;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = options?.rate ?? 1;

  if (options?.voice) {
    const voice = speechSynthesis.getVoices().find((v) => v.name === options.voice);
    if (voice) utterance.voice = voice;
  }

  if (options?.onEnd) utterance.onend = options.onEnd;

  speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (isTTSAvailable()) speechSynthesis.cancel();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/tts.ts && git commit -m "feat: add TTS wrapper with German voice support"
```

---

## Task 6: Test Content (3 Mock Tests)

**Files:**
- Create: `content/tests/test-01.json`
- Create: `content/tests/test-02.json`
- Create: `content/tests/test-03.json`
- Create: `src/lib/tests.ts`

- [ ] **Step 1: Create test loader utility**

Create `src/lib/tests.ts`:
```typescript
import fs from "fs";
import path from "path";
import type { MockTest } from "./types";

const TESTS_DIR = path.join(process.cwd(), "content/tests");

export function getAllTestIds(): string[] {
  const files = fs.readdirSync(TESTS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => f.replace(".json", ""));
}

export function getTestById(id: string): MockTest {
  const filePath = path.join(TESTS_DIR, `${id}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as MockTest;
}

export function getAllTests(): MockTest[] {
  return getAllTestIds().map(getTestById);
}
```

- [ ] **Step 2: Create test-01.json**

Create `content/tests/test-01.json` — a complete mock test. This is a large file (~400 lines). Content must be realistic B1-level German. Structure:

```json
{
  "id": "test-01",
  "title": "Übungstest 1",
  "level": "B1",
  "reading": {
    "part1": {
      "type": "matching",
      "instructions": "Lesen Sie die Überschriften (a-j) und die Texte (1-5). Welche Überschrift passt zu welchem Text?",
      "items": [
        { "id": "1", "text": "Am Samstag findet im Stadtpark ein großer Flohmarkt statt. Von 8 bis 16 Uhr kann man dort gebrauchte Bücher, Kleidung, Spielzeug und Möbel kaufen. Der Eintritt ist frei." },
        { "id": "2", "text": "Die neue Schwimmhalle am Bahnhof öffnet nächste Woche. Sie hat ein 50-Meter-Becken, einen Kinderbereich und eine Sauna. Erwachsene zahlen 6 Euro Eintritt." },
        { "id": "3", "text": "Ich suche eine Mitfahrgelegenheit von Berlin nach München am Freitag, den 15. März. Ich kann mich an den Benzinkosten beteiligen. Bitte melden Sie sich unter 0170-1234567." },
        { "id": "4", "text": "Der Deutschkurs für Anfänger beginnt am 1. April. Er findet montags und mittwochs von 18 bis 20 Uhr statt. Die Kursgebühr beträgt 120 Euro für 12 Wochen." },
        { "id": "5", "text": "Familie Schmidt sucht eine 3-Zimmer-Wohnung in der Innenstadt. Bis 800 Euro warm. Wir haben zwei Kinder und keine Haustiere. Kontakt: schmidt@email.de" }
      ],
      "options": [
        { "id": "a", "text": "Neues Sportangebot in der Stadt" },
        { "id": "b", "text": "Zusammen fahren und Geld sparen" },
        { "id": "c", "text": "Gebrauchte Sachen kaufen und verkaufen" },
        { "id": "d", "text": "Wohnung zu vermieten" },
        { "id": "e", "text": "Sprachen lernen am Abend" },
        { "id": "f", "text": "Familie sucht neues Zuhause" },
        { "id": "g", "text": "Neue Bibliothek eröffnet" },
        { "id": "h", "text": "Hilfe im Haushalt gesucht" },
        { "id": "i", "text": "Günstig reisen mit dem Zug" },
        { "id": "j", "text": "Sommerfest im Park" }
      ],
      "correctMatches": { "1": "c", "2": "a", "3": "b", "4": "e", "5": "f" }
    },
    "part2": {
      "type": "multiple-choice",
      "text": "Maria hat letztes Jahr eine Ausbildung als Krankenschwester begonnen. Am Anfang war es sehr schwer für sie, weil sie oft nachts arbeiten musste. Sie konnte sich lange nicht daran gewöhnen, tagsüber zu schlafen. Außerdem war die Arbeit körperlich anstrengend. Aber nach ein paar Monaten hat sie sich daran gewöhnt und findet die Arbeit jetzt sehr interessant.\n\nBesonders gut gefällt ihr der Kontakt mit den Patienten. Viele sind dankbar für ihre Hilfe und das motiviert sie jeden Tag. Ihre Kolleginnen und Kollegen sind auch sehr nett und helfen ihr, wenn sie Fragen hat.\n\nIn zwei Jahren wird Maria ihre Ausbildung beenden. Danach möchte sie gern in einem Kinderkrankenhaus arbeiten, weil sie besonders gern mit Kindern arbeitet. Sie überlegt auch, ob sie später noch ein Studium in Pflegewissenschaft machen soll.",
      "questions": [
        {
          "prompt": "Warum war der Anfang der Ausbildung schwer für Maria?",
          "options": [
            { "key": "a", "text": "Sie hat wenig Geld verdient." },
            { "key": "b", "text": "Sie musste oft in der Nacht arbeiten." },
            { "key": "c", "text": "Ihre Kollegen waren nicht freundlich." }
          ],
          "correct": "b"
        },
        {
          "prompt": "Was gefällt Maria an ihrer Arbeit besonders?",
          "options": [
            { "key": "a", "text": "Das hohe Gehalt." },
            { "key": "b", "text": "Die kurzen Arbeitszeiten." },
            { "key": "c", "text": "Der Kontakt mit den Patienten." }
          ],
          "correct": "c"
        },
        {
          "prompt": "Wie sind Marias Kollegen?",
          "options": [
            { "key": "a", "text": "Sie sind hilfsbereit und freundlich." },
            { "key": "b", "text": "Sie sprechen nicht viel mit Maria." },
            { "key": "c", "text": "Sie arbeiten lieber allein." }
          ],
          "correct": "a"
        },
        {
          "prompt": "Wann wird Maria mit der Ausbildung fertig sein?",
          "options": [
            { "key": "a", "text": "Nächstes Jahr." },
            { "key": "b", "text": "In zwei Jahren." },
            { "key": "c", "text": "In drei Jahren." }
          ],
          "correct": "b"
        },
        {
          "prompt": "Was möchte Maria nach der Ausbildung machen?",
          "options": [
            { "key": "a", "text": "In einem Kinderkrankenhaus arbeiten." },
            { "key": "b", "text": "Ins Ausland gehen." },
            { "key": "c", "text": "Eine eigene Praxis eröffnen." }
          ],
          "correct": "a"
        }
      ]
    },
    "part3": {
      "type": "matching",
      "instructions": "Lesen Sie die Situationen (1-10) und die Anzeigen (a-l). Welche Anzeige passt zu welcher Situation?",
      "items": [
        { "id": "1", "text": "Sie möchten am Wochenende mit Ihren Kindern etwas unternehmen." },
        { "id": "2", "text": "Sie suchen einen Job für den Abend." },
        { "id": "3", "text": "Ihr Computer ist kaputt und Sie brauchen Hilfe." },
        { "id": "4", "text": "Sie möchten Italienisch lernen." },
        { "id": "5", "text": "Sie suchen ein günstiges Fahrrad." },
        { "id": "6", "text": "Sie wollen am Samstag essen gehen." },
        { "id": "7", "text": "Ihre Waschmaschine funktioniert nicht mehr." },
        { "id": "8", "text": "Sie suchen eine Wohnung für zwei Personen." },
        { "id": "9", "text": "Sie möchten Sport in einer Gruppe machen." },
        { "id": "10", "text": "Sie brauchen jemanden, der auf Ihre Katze aufpasst." }
      ],
      "options": [
        { "id": "a", "text": "Familientag im Zoo — Jeden Sonntag: Kinder bis 12 Jahre frei! Viele Aktionen und Führungen." },
        { "id": "b", "text": "Kellner/in gesucht — Restaurant Roma sucht Bedienung für abends (18-23 Uhr). Erfahrung erwünscht." },
        { "id": "c", "text": "PC-Notdienst — Schnelle Hilfe bei Computerproblemen. Hausbesuche möglich. Tel: 030-9876543" },
        { "id": "d", "text": "Sprachschule International — Italienischkurse für Anfänger und Fortgeschrittene. Abendkurse ab September." },
        { "id": "e", "text": "Gebrauchte Fahrräder — Große Auswahl, ab 50 Euro. Reparaturservice. Mo-Sa 10-18 Uhr." },
        { "id": "f", "text": "Griechisches Restaurant Olympia — Samstags Live-Musik! Reservierung unter 030-1111222." },
        { "id": "g", "text": "Waschmaschinen-Reparatur — Alle Marken. 24h-Service. Festpreis 89 Euro. Anruf genügt!" },
        { "id": "h", "text": "2-Zimmer-Wohnung — 65 qm, Altbau, Balkon. 650 Euro warm. Ab sofort frei." },
        { "id": "i", "text": "Laufgruppe Stadtpark — Jeden Mittwoch 18 Uhr. Alle Levels willkommen. Einfach vorbeikommen!" },
        { "id": "j", "text": "Katzensitter gesucht? — Liebevolle Betreuung bei Ihnen zu Hause. Erfahrung mit Tieren. Flexible Zeiten." },
        { "id": "k", "text": "Nachhilfe Mathematik — Für Schüler Klasse 5-10. Einzelunterricht. 15 Euro/Stunde." },
        { "id": "l", "text": "Umzugshelfer — Zwei starke Männer helfen beim Umzug. LKW vorhanden. Fair Preise." }
      ],
      "correctMatches": { "1": "a", "2": "b", "3": "c", "4": "d", "5": "e", "6": "f", "7": "g", "8": "h", "9": "i", "10": "j" }
    }
  },
  "sprachbausteine": {
    "part1": {
      "type": "cloze-mc",
      "text": "Liebe Frau Müller,\n\nich schreibe Ihnen, {{1}} ich eine Frage zu meinem Mietvertrag habe. Ich habe {{2}} einen Brief von Ihnen bekommen, in dem steht, dass die Miete ab nächstem Monat steigt. Ich möchte gern wissen, {{3}} die Miete erhöht wird. In meinem Vertrag steht, {{4}} die Miete im ersten Jahr nicht steigen darf. Ich wohne aber {{5}} seit acht Monaten hier.\n\nKönnten Sie mir bitte erklären, {{6}} das bedeutet? Ich würde mich {{7}} freuen, wenn wir einen Termin {{8}} könnten, um darüber zu sprechen. Am besten {{9}} es mir am Donnerstagnachmittag. Bitte rufen Sie mich {{10}} 0170-9876543 an.\n\nMit freundlichen Grüßen\nThomas Weber",
      "blanks": [
        { "id": "1", "options": ["weil", "damit", "obwohl"], "correct": "weil" },
        { "id": "2", "options": ["gestern", "morgen", "übermorgen"], "correct": "gestern" },
        { "id": "3", "options": ["warum", "wann", "wo"], "correct": "warum" },
        { "id": "4", "options": ["ob", "dass", "weil"], "correct": "dass" },
        { "id": "5", "options": ["erst", "schon", "noch"], "correct": "erst" },
        { "id": "6", "options": ["was", "wer", "wie"], "correct": "was" },
        { "id": "7", "options": ["gern", "sehr", "viel"], "correct": "sehr" },
        { "id": "8", "options": ["machen", "haben", "nehmen"], "correct": "machen" },
        { "id": "9", "options": ["passt", "geht", "kommt"], "correct": "passt" },
        { "id": "10", "options": ["unter", "auf", "mit"], "correct": "unter" }
      ]
    },
    "part2": {
      "type": "cloze-wordbank",
      "text": "Sehr geehrte Damen und Herren,\n\nich habe Ihre Anzeige für die Stelle als Verkäufer {{1}}. Ich bin 28 Jahre alt und habe drei Jahre {{2}} in einem Schuhgeschäft gearbeitet. Ich {{3}} sehr gut mit Kunden umgehen und bin {{4}} und freundlich.\n\nMomentam {{5}} ich einen Deutschkurs, weil ich mein Deutsch noch {{6}} möchte. Ich kann sofort {{7}} und bin auch bereit, am Wochenende zu {{8}}. Über eine Einladung zu einem {{9}} würde ich mich sehr freuen.\n\nMit freundlichen {{10}}\nAna Petrova",
      "wordbank": [
        "gelesen", "Erfahrung", "kann", "zuverlässig", "besuche",
        "verbessern", "anfangen", "arbeiten", "Vorstellungsgespräch", "Grüßen",
        "geschrieben", "Ausbildung", "will", "pünktlich", "lerne"
      ],
      "correctFills": {
        "1": "gelesen",
        "2": "Erfahrung",
        "3": "kann",
        "4": "zuverlässig",
        "5": "besuche",
        "6": "verbessern",
        "7": "anfangen",
        "8": "arbeiten",
        "9": "Vorstellungsgespräch",
        "10": "Grüßen"
      }
    }
  },
  "listening": {
    "part1": {
      "type": "true-false",
      "dialogues": [
        {
          "transcript": "Mann: Entschuldigung, können Sie mir sagen, wo der nächste Supermarkt ist?\nFrau: Ja, gehen Sie hier geradeaus und dann die zweite Straße links. Der Supermarkt ist auf der rechten Seite.\nMann: Ist er noch geöffnet? Es ist schon fast 20 Uhr.\nFrau: Ja, der hat bis 22 Uhr auf.",
          "questions": [{ "prompt": "Der Supermarkt ist schon geschlossen.", "correct": false }]
        },
        {
          "transcript": "Frau: Hallo Peter, kommst du morgen zu meiner Geburtstagsfeier?\nMann: Oh, das tut mir leid, aber morgen muss ich arbeiten. Ich habe Spätschicht bis 22 Uhr.\nFrau: Schade! Dann feiern wir am Wochenende zusammen, okay?\nMann: Ja, das machen wir!",
          "questions": [{ "prompt": "Peter kann nicht zur Geburtstagsfeier kommen.", "correct": true }]
        },
        {
          "transcript": "Mann: Guten Tag, ich möchte dieses Hemd umtauschen. Es ist zu klein.\nFrau: Haben Sie den Kassenbon noch?\nMann: Ja, hier bitte.\nFrau: Kein Problem. Welche Größe brauchen Sie?\nMann: Eine Nummer größer, also L bitte.",
          "questions": [{ "prompt": "Der Mann möchte sein Geld zurück.", "correct": false }]
        },
        {
          "transcript": "Frau: Sag mal, hast du schon gehört? Der Kurs von Frau Schmidt fällt nächste Woche aus.\nMann: Wirklich? Warum denn?\nFrau: Sie ist krank geworden. Aber in zwei Wochen geht es normal weiter.\nMann: Na gut, dann habe ich nächste Woche mehr Zeit zum Lernen.",
          "questions": [{ "prompt": "Der Kurs findet nächste Woche statt.", "correct": false }]
        },
        {
          "transcript": "Mann: Wie war dein Urlaub in Spanien?\nFrau: Super! Das Wetter war perfekt, 30 Grad jeden Tag. Und das Hotel war direkt am Strand.\nMann: Toll! Und das Essen?\nFrau: Fantastisch! Ich habe jeden Abend frischen Fisch gegessen.",
          "questions": [{ "prompt": "Die Frau war mit ihrem Urlaub zufrieden.", "correct": true }]
        }
      ]
    },
    "part2": {
      "type": "true-false",
      "dialogues": [
        {
          "transcript": "Moderator: Willkommen bei Radio Aktuell. Heute sprechen wir mit Frau Dr. Berger über gesunde Ernährung. Frau Dr. Berger, viele Menschen möchten sich gesünder ernähren. Was empfehlen Sie?\n\nDr. Berger: Zunächst einmal ist es wichtig, regelmäßig zu essen. Drei Hauptmahlzeiten am Tag sind ideal. Viele Leute lassen das Frühstück aus, aber das ist ein Fehler. Der Körper braucht morgens Energie.\n\nModerator: Was sollte man zum Frühstück essen?\n\nDr. Berger: Am besten Vollkornbrot mit Käse oder Müsli mit Obst. Man sollte nicht zu viel Zucker essen, besonders nicht am Morgen. Und ganz wichtig: viel trinken! Mindestens zwei Liter Wasser am Tag.\n\nModerator: Und was ist mit Fleisch?\n\nDr. Berger: Fleisch ist in Ordnung, aber nicht jeden Tag. Zwei- bis dreimal pro Woche reicht. Und man sollte mehr Gemüse essen. Die Hälfte von jedem Teller sollte Gemüse sein.\n\nModerator: Was halten Sie von Diäten?\n\nDr. Berger: Die meisten Diäten funktionieren nicht langfristig. Besser ist es, die Ernährung langsam umzustellen. Kleine Veränderungen sind nachhaltiger als radikale Diäten. Und Bewegung gehört natürlich auch dazu — mindestens 30 Minuten am Tag.\n\nModerator: Vielen Dank, Frau Dr. Berger!",
          "questions": [
            { "prompt": "Dr. Berger empfiehlt, fünf Mahlzeiten am Tag zu essen.", "correct": false },
            { "prompt": "Man sollte das Frühstück nicht auslassen.", "correct": true },
            { "prompt": "Zum Frühstück empfiehlt Dr. Berger Vollkornbrot oder Müsli.", "correct": true },
            { "prompt": "Man sollte mindestens drei Liter Wasser am Tag trinken.", "correct": false },
            { "prompt": "Fleisch sollte man jeden Tag essen.", "correct": false },
            { "prompt": "Die Hälfte des Tellers sollte Gemüse sein.", "correct": true },
            { "prompt": "Dr. Berger findet Diäten sehr gut.", "correct": false },
            { "prompt": "Kleine Veränderungen in der Ernährung sind besser als Diäten.", "correct": true },
            { "prompt": "Man sollte täglich mindestens 30 Minuten Sport machen.", "correct": true },
            { "prompt": "Dr. Berger sagt, Bewegung ist nicht so wichtig.", "correct": false }
          ]
        }
      ]
    },
    "part3": {
      "type": "matching",
      "instructions": "Sie hören fünf kurze Nachrichten. Welche Nachricht passt zu welcher Situation?",
      "items": [
        { "id": "1", "text": "Guten Tag, hier ist die Arztpraxis Dr. Klein. Ihr Termin am Montag um 10 Uhr muss leider verschoben werden. Können Sie stattdessen am Dienstag um 14 Uhr kommen? Bitte rufen Sie uns zurück." },
        { "id": "2", "text": "Hallo Mama, ich bin es, Lisa. Ich komme heute etwas später nach Hause, weil ich noch mit einer Freundin lerne. Wir schreiben morgen einen Test in Mathe. Bis heute Abend!" },
        { "id": "3", "text": "Sehr geehrte Fahrgäste, der Zug nach Hamburg hat heute leider 20 Minuten Verspätung. Wir bitten um Ihr Verständnis. Der Zug fährt voraussichtlich um 15:40 Uhr ab." },
        { "id": "4", "text": "Hallo Thomas, hier ist Mark. Ich wollte fragen, ob du am Samstag Lust hast, Fußball zu spielen. Wir treffen uns um 15 Uhr im Stadtpark. Ruf mich an, wenn du kommst!" },
        { "id": "5", "text": "Guten Tag, Frau Weber. Hier ist die Bibliothek. Die Bücher, die Sie bestellt haben, sind angekommen. Sie können sie ab morgen abholen. Unsere Öffnungszeiten sind Montag bis Freitag, 9 bis 18 Uhr." }
      ],
      "options": [
        { "id": "a", "text": "Eine Einladung zum Sport" },
        { "id": "b", "text": "Information über eine Verspätung" },
        { "id": "c", "text": "Eine Terminänderung" },
        { "id": "d", "text": "Eine Nachricht von einem Kind" },
        { "id": "e", "text": "Bücher sind abholbereit" },
        { "id": "f", "text": "Einladung zu einer Party" },
        { "id": "g", "text": "Information über einen Kurs" }
      ],
      "correctMatches": { "1": "c", "2": "d", "3": "b", "4": "a", "5": "e" }
    }
  },
  "writing": {
    "task": {
      "prompt": "Sie haben eine Anzeige für einen Deutschkurs an einer Sprachschule gelesen. Schreiben Sie einen Brief an die Sprachschule.",
      "situation": "Sie haben in der Zeitung eine Anzeige gelesen: Die Sprachschule \"Lingua\" bietet Deutschkurse für alle Niveaus an. Sie möchten sich für einen Kurs anmelden.",
      "contentPoints": [
        "Warum Sie Deutsch lernen möchten",
        "Welches Niveau Sie haben",
        "Wann Sie Zeit für den Kurs haben",
        "Fragen Sie nach dem Preis und den Materialien"
      ],
      "modelAnswer": "Sehr geehrte Damen und Herren,\n\nich habe Ihre Anzeige für Deutschkurse in der Zeitung gelesen und interessiere mich sehr dafür. Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte und gute Deutschkenntnisse für meinen Beruf brauche.\n\nIch habe schon einen A2-Kurs besucht und möchte jetzt einen B1-Kurs machen. Ich kann abends ab 18 Uhr und am Wochenende am Kurs teilnehmen, weil ich tagsüber arbeite.\n\nKönnten Sie mir bitte sagen, wie viel der Kurs kostet? Und muss ich die Bücher selbst kaufen oder sind sie im Preis enthalten?\n\nIch freue mich auf Ihre Antwort.\n\nMit freundlichen Grüßen\nAnna Müller"
    }
  },
  "speaking": {
    "part1": {
      "instructions": "Stellen Sie sich Ihrem Partner / Ihrer Partnerin vor. Sprechen Sie über die folgenden Punkte:",
      "prompts": [
        "Name",
        "Woher kommen Sie?",
        "Wo wohnen Sie jetzt?",
        "Was machen Sie beruflich? / Was studieren Sie?",
        "Welche Sprachen sprechen Sie?",
        "Was sind Ihre Hobbys?"
      ],
      "modelAnswer": "Hallo, ich heiße Maria und komme aus Spanien, aus einer kleinen Stadt in der Nähe von Madrid. Jetzt wohne ich seit zwei Jahren in Berlin. Ich arbeite als Grafikdesignerin in einer kleinen Agentur. Ich spreche Spanisch als Muttersprache und außerdem Englisch und ein bisschen Deutsch — deshalb bin ich hier! In meiner Freizeit gehe ich gern ins Kino und mache Yoga. Ich lese auch gern Romane.",
      "checklist": [
        "Habe ich meinen Namen gesagt?",
        "Habe ich über meine Herkunft gesprochen?",
        "Habe ich meinen Wohnort erwähnt?",
        "Habe ich über meinen Beruf/mein Studium gesprochen?",
        "Habe ich meine Sprachkenntnisse genannt?",
        "Habe ich über meine Hobbys gesprochen?"
      ]
    },
    "part2": {
      "instructions": "Sprechen Sie mit Ihrem Partner / Ihrer Partnerin über das Thema \"Gesunde Ernährung\". Tauschen Sie Ihre Meinungen und Erfahrungen aus.",
      "prompts": [
        "Achten Sie auf gesunde Ernährung? Warum / warum nicht?",
        "Was essen Sie normalerweise zum Frühstück/Mittag/Abend?",
        "Kochen Sie selbst oder essen Sie oft auswärts?",
        "Gibt es Lebensmittel, die Sie nicht essen?",
        "Was denken Sie: Was ist das Wichtigste für eine gesunde Ernährung?"
      ],
      "modelAnswer": "Ja, ich achte ziemlich auf gesunde Ernährung, weil ich mich dann besser fühle. Zum Frühstück esse ich meistens Müsli mit Obst und trinke einen Kaffee. Mittags esse ich oft in der Kantine bei der Arbeit — da gibt es immer auch Salat. Abends koche ich gern selbst, zum Beispiel Gemüse mit Reis oder Pasta.\n\nIch esse kein Fleisch, weil ich Vegetarierin bin. Aber ich esse Fisch und Milchprodukte. Ich denke, das Wichtigste ist, viel Gemüse und Obst zu essen und nicht zu viel Zucker. Und natürlich genug Wasser trinken!",
      "checklist": [
        "Habe ich meine Meinung zum Thema gesagt?",
        "Habe ich über meine Essgewohnheiten gesprochen?",
        "Habe ich Beispiele gegeben?",
        "Habe ich auf Fragen des Partners reagiert?",
        "Habe ich zusammenhängend gesprochen?"
      ]
    },
    "part3": {
      "instructions": "Sie und Ihr Partner / Ihre Partnerin möchten zusammen einen Ausflug am Wochenende machen. Planen Sie den Ausflug gemeinsam.",
      "prompts": [
        "Wohin möchten Sie fahren?",
        "Wann möchten Sie losfahren?",
        "Wie kommen Sie dorthin (Auto, Zug, Bus)?",
        "Was möchten Sie dort machen?",
        "Was müssen Sie mitnehmen?"
      ],
      "modelAnswer": "Ich schlage vor, dass wir an den Wannsee fahren. Da können wir spazieren gehen und vielleicht ein Picknick machen. Wollen wir am Samstagmorgen fahren? Sagen wir um 10 Uhr?\n\nWir können mit der S-Bahn fahren, das ist am einfachsten und dauert nur 30 Minuten. Am See können wir spazieren gehen, und wenn das Wetter gut ist, können wir auch schwimmen gehen.\n\nWir sollten Essen und Getränke mitnehmen für das Picknick. Und Badesachen, falls wir schwimmen wollen. Ich bringe eine Decke mit. Kannst du die Getränke mitbringen?",
      "checklist": [
        "Haben wir ein Ziel vereinbart?",
        "Haben wir eine Uhrzeit ausgemacht?",
        "Haben wir das Verkehrsmittel besprochen?",
        "Haben wir Aktivitäten geplant?",
        "Haben wir besprochen, was wir mitnehmen?"
      ]
    }
  }
}
```

Write this complete JSON file. Then create `test-02.json` and `test-03.json` with different but equally realistic B1-level content. Each test must have entirely different texts, questions, and topics.

**Test 02 topics:** Reading about workplace/Arbeitswelt, Sprachbausteine about vacation booking, Listening about health/doctor, Writing a complaint letter, Speaking about travel.

**Test 03 topics:** Reading about education/Bildung, Sprachbausteine about apartment search, Listening about shopping/daily life, Writing an invitation letter, Speaking about technology.

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/tests/test-01.json'))"
node -e "JSON.parse(require('fs').readFileSync('content/tests/test-02.json'))"
node -e "JSON.parse(require('fs').readFileSync('content/tests/test-03.json'))"
```

- [ ] **Step 4: Verify test loader compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add content/ src/lib/tests.ts && git commit -m "feat: add test loader and 3 mock test JSON files"
```

---

## Task 7: Theme Provider & Root Layout

**Files:**
- Create: `src/components/layout/ThemeProvider.tsx`
- Create: `src/components/layout/Nav.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/hooks/useSettings.ts`

- [ ] **Step 1: Create useSettings hook**

Create `src/hooks/useSettings.ts`:
```typescript
"use client";
import { useState, useEffect } from "react";
import { db, getSettings } from "@/lib/db";
import type { Settings } from "@/lib/types";

const DEFAULT_SETTINGS: Settings = {
  ttsVoice: "",
  ttsSpeed: 1,
  timerEnabled: true,
  theme: "light",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    if (settings.id) {
      await db.settings.update(settings.id, updates);
    }
  };

  return { settings, updateSettings, loaded };
}
```

- [ ] **Step 2: Add theme toggle to useSettings**

Add a `toggleTheme` method to `useSettings` that updates the IndexedDB setting and applies the `dark` class to `<html>`:
```typescript
const toggleTheme = async () => {
  const next = settings.theme === "light" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", next === "dark");
  await updateSettings({ theme: next });
};
```

Export `toggleTheme` from the hook alongside `settings`, `updateSettings`, and `loaded`.

- [ ] **Step 3: Create ThemeProvider**

Create `src/components/layout/ThemeProvider.tsx`:
```typescript
"use client";
import { useEffect } from "react";
import { getSettings } from "@/lib/db";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSettings().then((s) => {
      document.documentElement.classList.toggle("dark", s.theme === "dark");
    });
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 4: Create Nav component**

Create `src/components/layout/Nav.tsx`:
```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/sessions", label: "Sessions", icon: "📋" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Nav() {
  const pathname = usePathname();
  const { settings, toggleTheme } = useSettings();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">B1 Deutsch</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="mr-3">{settings.theme === "light" ? "🌙" : "☀️"}</span>
              {settings.theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 5: Update root layout**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Nav } from "@/components/layout/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B1 Deutsch — telc Exam Practice",
  description: "Practice for the telc Deutsch B1 exam",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <Nav />
          <main className="md:pl-64 pb-16 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Update globals.css for dark mode**

Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Enable dark mode in Tailwind config**

Update `tailwind.config.ts` to add `darkMode: "class"`.

- [ ] **Step 8: Verify dev server renders**

```bash
npm run dev
```
Open http://localhost:3000 — should see sidebar with "B1 Deutsch" heading.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: add layout with responsive nav, theme toggle, and settings hook"
```

---

## Task 8: Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement dashboard**

Replace `src/app/page.tsx`:
```typescript
import Link from "next/link";
import { getAllTests } from "@/lib/tests";
import { DashboardClient } from "./DashboardClient";

export default function Dashboard() {
  const tests = getAllTests();
  return <DashboardClient tests={tests.map((t) => ({ id: t.id, title: t.title }))} />;
}
```

Create `src/app/DashboardClient.tsx`:
```typescript
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Session } from "@/lib/types";
import { calculateTotalScore, isPassing } from "@/lib/scoring";

interface Props {
  tests: { id: string; title: string }[];
}

export function DashboardClient({ tests }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    db.sessions
      .orderBy("lastActivityAt")
      .reverse()
      .limit(5)
      .toArray()
      .then((s) => {
        setSessions(s);
        setLoaded(true);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Available tests */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Available Tests
        </h3>
        {tests.length === 0 ? (
          <p className="text-gray-500">No mock tests found. Add JSON test files to content/tests/ and rebuild.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <h4 className="font-medium">{test.title}</h4>
                <p className="text-sm text-gray-500 mt-1">telc Deutsch B1</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats — only shown when there are completed sessions */}
      {loaded && sessions.filter((s) => s.status === "completed").length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Your Progress
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Total completed */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold">{sessions.filter((s) => s.status === "completed").length}</div>
              <div className="text-sm text-gray-500">Tests completed</div>
            </div>
            {/* Best score — compute from completed sessions using calculateTotalScore */}
            {/* Pass rate — percentage of completed sessions that are passing */}
          </div>
          {/* Per-section score bars for latest completed session */}
          {/* Trend: if same test taken multiple times, show score progression */}
        </section>
      )}

      {/* Recent sessions */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Recent Sessions
        </h3>
        {!loaded ? (
          <p className="text-gray-500">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500">No sessions yet. Start a test to begin practicing!</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div>
                  <span className="font-medium">{session.testId}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {session.mode}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    session.status === "completed"
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(session.lastActivityAt).toLocaleDateString("de-DE")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify dashboard renders with test cards**

```bash
npm run dev
```
Expected: 3 test cards visible on dashboard

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add dashboard with test list and recent sessions"
```

---

## Task 9: Test Overview Page

**Files:**
- Create: `src/app/test/[id]/page.tsx`
- Create: `src/app/test/[id]/TestOverviewClient.tsx`

- [ ] **Step 1: Create server page with generateStaticParams**

Create `src/app/test/[id]/page.tsx`:
```typescript
import { getAllTestIds, getTestById } from "@/lib/tests";
import { TestOverviewClient } from "./TestOverviewClient";

export function generateStaticParams() {
  return getAllTestIds().map((id) => ({ id }));
}

export default async function TestOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = getTestById(id);
  return <TestOverviewClient testId={test.id} testTitle={test.title} />;
}
```

- [ ] **Step 2: Create client component**

Create `src/app/test/[id]/TestOverviewClient.tsx` — shows 5 section cards (Reading, Sprachbausteine, Listening, Writing, Speaking) with part links, "Start Full Test" button for exam mode, and per-section practice buttons. When starting a session, creates a new Session in IndexedDB via `createEmptySession`, then navigates to the first part.

Sections to display:
- Reading: Part 1 (Matching), Part 2 (Multiple Choice), Part 3 (Matching)
- Sprachbausteine: Part 1 (Cloze MC), Part 2 (Cloze Wordbank)
- Listening: Part 1 (True/False), Part 2 (True/False), Part 3 (Matching)
- Writing: Task
- Speaking: Part 1, Part 2, Part 3

Each section card links to `/test/[id]/[section]/[part]?sessionId=X`.

- [ ] **Step 3: Verify page renders**

```bash
npm run dev
```
Navigate to `/test/test-01` — should see 5 section cards.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add test overview page with section cards"
```

---

## Accessibility Note (applies to Tasks 10-16, 21-26)

All interactive components must follow WCAG 2.1 AA:
- Use semantic HTML (`<fieldset>`, `<legend>`, `<label>`, `<button>`) over `<div>` with click handlers
- All form controls must be keyboard-accessible (Tab to navigate, Enter/Space to select)
- Use `role` and `aria-label` attributes where semantic HTML is insufficient (e.g., drag-and-drop targets)
- Ensure color is not the only indicator — use icons or text alongside green/red in review mode
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus indicators must be visible (don't remove `:focus-visible` outlines)

---

## Task 10: Exercise Components — MultipleChoice

**Files:**
- Create: `src/components/exercises/MultipleChoice.tsx`

- [ ] **Step 1: Implement MultipleChoice component**

Props: `{ exercise: MultipleChoiceExercise, answers: Record<number, string>, onAnswer: (questionIndex: number, key: string) => void }`

Renders: scrollable text passage, then numbered questions with radio-button options using `<fieldset>` + `<legend>` + `<input type="radio">` + `<label>`. Selected option gets blue highlight. No feedback shown.

- [ ] **Step 2: Verify it renders in isolation**

Temporarily import in a test page, pass sample data, confirm radio selection works.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercises/MultipleChoice.tsx && git commit -m "feat: add MultipleChoice exercise component"
```

---

## Task 11: Exercise Components — Matching

**Files:**
- Create: `src/components/exercises/Matching.tsx`

- [ ] **Step 1: Implement Matching component**

Props: `{ exercise: MatchingExercise, answers: Record<string, string>, onAnswer: (itemId: string, optionId: string) => void }`

Two-column layout. Left column: items. Right column: options. Click-to-pair interaction: click an item, then click an option to match them. Matched pairs share a color. Click a matched item to unmatch. On mobile: tap-to-select (same flow but with tappable cards).

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/Matching.tsx && git commit -m "feat: add Matching exercise component"
```

---

## Task 12: Exercise Components — TrueFalse

**Files:**
- Create: `src/components/exercises/TrueFalse.tsx`

- [ ] **Step 1: Implement TrueFalse component**

Props: `{ exercise: TrueFalseExercise, answers: Record<number, boolean>, onAnswer: (index: number, value: boolean) => void }`

List of statements with Richtig/Falsch toggle buttons per statement.

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/TrueFalse.tsx && git commit -m "feat: add TrueFalse exercise component"
```

---

## Task 13: Exercise Components — ClozeDropdown

**Files:**
- Create: `src/components/exercises/ClozeDropdown.tsx`

- [ ] **Step 1: Implement ClozeDropdown component**

Props: `{ exercise: ClozeMCExercise, answers: Record<string, string>, onAnswer: (blankId: string, value: string) => void }`

Renders text with `{{N}}` placeholders replaced by inline `<select>` dropdowns. Each dropdown shows the 3 options. Selected value is highlighted.

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/ClozeDropdown.tsx && git commit -m "feat: add ClozeDropdown exercise component"
```

---

## Task 14: Exercise Components — ClozeWordbank

**Files:**
- Create: `src/components/exercises/ClozeWordbank.tsx`

- [ ] **Step 1: Implement ClozeWordbank component**

Props: `{ exercise: ClozeWordbankExercise, answers: Record<string, string>, onAnswer: (blankId: string, word: string) => void }`

Word bank displayed at top as clickable chips. Text below with blanks. Click a word, then click a blank to place it. Click a filled blank to remove the word back to the bank. Uses `@hello-pangea/dnd` for drag-and-drop on desktop; tap-to-select works as described for mobile.

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/ClozeWordbank.tsx && git commit -m "feat: add ClozeWordbank exercise component"
```

---

## Task 15: Exercise Components — WritingTask & SpeakingTask

**Files:**
- Create: `src/components/exercises/WritingTask.tsx`
- Create: `src/components/exercises/SpeakingTask.tsx`

- [ ] **Step 1: Implement WritingTask**

Props: `{ exercise: WritingTask, answer: string, onAnswer: (text: string) => void }`

Shows situation box, 4 content points as bullet list, then a textarea. Word count displayed below textarea.

- [ ] **Step 2: Implement SpeakingTask**

Props: `{ task: SpeakingTask, answer: SpeakingAnswer, onAnswer: (answer: SpeakingAnswer) => void }`

Shows instructions, prompt list, textarea for preparation notes, and self-assessment checklist (checkboxes).

- [ ] **Step 3: Commit**

```bash
git add src/components/exercises/WritingTask.tsx src/components/exercises/SpeakingTask.tsx && git commit -m "feat: add WritingTask and SpeakingTask exercise components"
```

---

## Task 16: Exercise Components — ListeningPlayer

**Files:**
- Create: `src/components/exercises/ListeningPlayer.tsx`

- [ ] **Step 1: Implement ListeningPlayer**

Props: `{ transcript: string, settings: { voice: string, speed: number } }`

Play/pause/stop buttons. Uses `speak()` from `src/lib/tts.ts`. "Show transcript" toggle — hidden by default. If TTS unavailable, auto-shows transcript with notice message.

- [ ] **Step 2: Commit**

```bash
git add src/components/exercises/ListeningPlayer.tsx && git commit -m "feat: add ListeningPlayer with TTS and transcript fallback"
```

---

## Task 17: Timer Hook

**Files:**
- Create: `src/hooks/useTimer.ts`
- Create: `__tests__/hooks/useTimer.test.ts`

- [ ] **Step 1: Write timer tests**

Create `__tests__/hooks/useTimer.test.ts`:
```typescript
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "@/hooks/useTimer";

jest.useFakeTimers();

describe("useTimer", () => {
  it("counts down from initial seconds", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useTimer(60, true, onExpire));

    expect(result.current.remaining).toBe(60);

    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.remaining).toBe(59);
  });

  it("calls onExpire when reaching 0", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useTimer(2, true, onExpire));

    act(() => { jest.advanceTimersByTime(2000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(result.current.remaining).toBe(0);
  });

  it("does not count when disabled", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useTimer(60, false, onExpire));

    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.remaining).toBe(60);
  });

  it("formats time correctly", () => {
    const { result } = renderHook(() => useTimer(5425, true, jest.fn()));
    expect(result.current.formatted).toBe("90:25");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npx jest __tests__/hooks/useTimer.test.ts
```

- [ ] **Step 3: Implement useTimer**

Create `src/hooks/useTimer.ts`:
```typescript
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(
  initialSeconds: number,
  enabled: boolean,
  onExpire: () => void
) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!enabled || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, remaining]);

  const formatted = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return { remaining, formatted };
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npx jest __tests__/hooks/useTimer.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTimer.ts __tests__/hooks/useTimer.test.ts && git commit -m "feat: add useTimer hook with tests"
```

---

## Task 18: Timer Display Component

**Files:**
- Create: `src/components/layout/Timer.tsx`

- [ ] **Step 1: Implement Timer display**

Create `src/components/layout/Timer.tsx`:
```typescript
"use client";

interface Props {
  formatted: string;
  remaining: number;
}

export function Timer({ formatted, remaining }: Props) {
  const urgent = remaining < 300; // < 5 min
  return (
    <div
      className={`font-mono text-lg font-bold px-4 py-2 rounded-lg ${
        urgent
          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 animate-pulse"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      }`}
    >
      {formatted}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Timer.tsx && git commit -m "feat: add Timer display component"
```

---

## Task 19: Session Hook (useSession)

**Files:**
- Create: `src/hooks/useSession.ts`

- [ ] **Step 1: Implement useSession hook**

Create `src/hooks/useSession.ts`:

Provides:
- `loadSession(sessionId: number)` — load from IndexedDB
- `updateAnswer(section, part, answers)` — update answer + auto-save with debounce
- `submitSection(sectionBlock, testData)` — mark section parts as completed, compute scores. For Sprachbausteine Part 1, transform `blanks[].correct` into a `Record<string, string>` map before calling `scoreClozePart`.
- `submitAll(testData)` — submit all sections
- `session` — current session state
- `isSectionBlockSubmitted(sectionBlock)` — returns true if all parts in block have `completedAt` set
- `getNextUnlockedBlock()` — in exam mode, returns the first unsubmitted block in `EXAM_SECTION_ORDER`; in practice mode returns null (all unlocked)

Auto-saves to IndexedDB on every `updateAnswer` call (debounced 300ms). Updates `lastActivityAt` on each save.

**Defensive loading:** When loading a session, validate that `sections` has the expected shape. If any fields are missing (corrupted data), set `status` to `"incomplete"` and return it without crashing. The Sessions page will display such sessions with a delete option.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSession.ts && git commit -m "feat: add useSession hook with auto-save"
```

---

## Task 20: Notes Hook & Panel

**Files:**
- Create: `src/hooks/useNotes.ts`
- Create: `src/components/layout/NotesPanel.tsx`

- [ ] **Step 1: Implement useNotes hook**

Create `src/hooks/useNotes.ts`:

Provides:
- `notes` — array of notes for current context (session/question)
- `allNotes` — all notes
- `addNote(content, tags, context?)` — create note
- `updateNote(id, content, tags)` — edit note
- `deleteNote(id)` — remove note
- `searchNotes(query)` — full-text search on content and tags

- [ ] **Step 2: Implement NotesPanel component**

Create `src/components/layout/NotesPanel.tsx`:

Slide-out sidebar (right side). Toggle button visible during exercises. Shows notes for current question context + "add note" form. Each note editable/deletable inline. Tags displayed as colored chips.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useNotes.ts src/components/layout/NotesPanel.tsx && git commit -m "feat: add notes hook and slide-out panel"
```

---

## Task 21: Exercise View Page (Core Router)

**Files:**
- Create: `src/app/test/[id]/[section]/[part]/page.tsx`
- Create: `src/app/test/[id]/[section]/[part]/ExerciseClient.tsx`

- [ ] **Step 1: Create server page with generateStaticParams**

Create `src/app/test/[id]/[section]/[part]/page.tsx`:

Generate params for all test × section × part combinations. Load the test JSON server-side and pass the specific exercise data to the client component.

- [ ] **Step 2: Create ExerciseClient**

Create `src/app/test/[id]/[section]/[part]/ExerciseClient.tsx`:

This is the core orchestration component. It:
1. Reads `sessionId` from URL search params
2. Loads session via `useSession`
3. Renders the correct exercise component based on exercise type
4. For listening sections: wraps exercise with `ListeningPlayer`
5. Shows Timer (if exam mode and timer enabled). **Wire `onExpire` callback to `submitSection`** — when timer hits 0, auto-submit the current section block.
6. Shows NotesPanel toggle
7. Shows navigation: "Previous Part" / "Next Part" / "Submit Section" buttons
8. Part navigation within the current section block only. **Exam mode guard:** use `isSectionBlockSubmitted` and `getNextUnlockedBlock` from `useSession` to prevent navigating to locked/submitted sections. Show a lock icon on inaccessible sections.
9. "Submit" button triggers `submitSection` or `submitAll` with **confirmation dialog**: `window.confirm("Are you sure? You won't be able to change answers after submitting.")`. Only proceed if confirmed.
10. After submission, in exam mode: navigate to first part of next unlocked block. After all blocks submitted: redirect to `/results?sessionId=X`
11. All interactive elements (buttons, radio inputs, dropdowns, drag targets) must have appropriate `aria-label` attributes and be keyboard-navigable (tab order, Enter/Space to select)

- [ ] **Step 3: Verify full flow works**

```bash
npm run dev
```
Navigate to Dashboard → Click test → Start practice → Answer questions → Navigate between parts → Verify answers save.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add exercise view page with dynamic component routing"
```

---

## Task 22: Review Components

**Files:**
- Create: `src/components/review/ScoreSummary.tsx`
- Create: `src/components/review/MultipleChoiceReview.tsx`
- Create: `src/components/review/MatchingReview.tsx`
- Create: `src/components/review/TrueFalseReview.tsx`
- Create: `src/components/review/ClozeReview.tsx`
- Create: `src/components/review/WritingReview.tsx`
- Create: `src/components/review/SpeakingReview.tsx`

- [ ] **Step 1: Implement ScoreSummary**

Shows total score / 180, pass/fail badge, per-section score bars, writing/speaking completion status.

- [ ] **Step 2: Implement per-type review components**

Each review component takes the exercise data + user answers + correct answers and renders:
- **MultipleChoiceReview** — each question with user's answer (green if correct, red if wrong) and correct answer shown
- **MatchingReview** — matched pairs with green/red indicators
- **TrueFalseReview** — each statement with user's answer and correct answer
- **ClozeReview** — text with blanks showing user's word and correct word
- **WritingReview** — side-by-side: user's text (left) and model answer (right), content points checklist
- **SpeakingReview** — model answer, user's notes, self-assessment results

- [ ] **Step 3: Commit**

```bash
git add src/components/review/ && git commit -m "feat: add review components for all exercise types"
```

---

## Task 23: Results Page

**Files:**
- Create: `src/app/results/page.tsx`

- [ ] **Step 1: Create results page**

This is a **single client page at `/results`** that reads `sessionId` from query params (`/results?sessionId=X`). This avoids the static export problem — no dynamic `[sessionId]` route needed.

Create `src/app/results/page.tsx` as a `"use client"` component that:
1. Reads `sessionId` from `useSearchParams()`
2. Loads session from IndexedDB by sessionId
3. Loads test data — since we can't use server-side `fs` in a client component, **import all test JSON files statically** at the top (`import test01 from "@/../content/tests/test-01.json"` etc.) and look up by `session.testId`
4. Renders ScoreSummary at top
5. Renders per-section collapsible review panels with the appropriate review component
6. Link back to dashboard
7. If sessionId is missing or session not found, show error state with link to dashboard

- [ ] **Step 2: Verify end-to-end flow**

Dashboard → Start test → Answer all parts → Submit → See results page with scores and per-question review.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add results page with score summary and per-question review"
```

---

## Task 24: Sessions Page

**Files:**
- Create: `src/app/sessions/page.tsx`

- [ ] **Step 1: Implement sessions page**

Client component that:
1. Loads all sessions from IndexedDB, sorted by date descending
2. Filter controls: by test, by status (all/completed/in-progress), by date range
3. Each session row shows: test name, mode, status, date, score (if completed)
4. Completed sessions link to `/results?sessionId=X`
5. In-progress sessions link to resume (test overview page with session context)
6. Delete session button (with confirmation)

- [ ] **Step 2: Commit**

```bash
git add src/app/sessions/ && git commit -m "feat: add sessions history page"
```

---

## Task 25: Notes Page

**Files:**
- Create: `src/app/notes/page.tsx`

- [ ] **Step 1: Implement notes page**

Client component that:
1. Loads all notes from IndexedDB
2. Search bar — filters notes by content and tags
3. Tag filter — clickable tag chips to filter
4. Each note shows: content preview, tags, context (which test/section/question if linked), date
5. Click to expand and edit inline
6. "Add note" button for standalone notes
7. Delete with confirmation

- [ ] **Step 2: Commit**

```bash
git add src/app/notes/ && git commit -m "feat: add notes manager page"
```

---

## Task 26: Settings Page with Export/Import

**Files:**
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Implement settings page**

Client component with:
- **TTS Settings:** Voice selector dropdown (populated from `getGermanVoices()`), speed slider (0.5-2x), test button
- **Timer:** Toggle on/off
- **Theme:** Light/Dark toggle
- **Data Export:** "Export All Data" button — downloads JSON file with all sessions and notes
- **Data Import:** File upload input — parse JSON, show preview (X sessions, Y notes), confirm dialog, merge into IndexedDB (skip duplicates by id)

Export format:
```json
{
  "version": 1,
  "exportedAt": "2026-06-10T...",
  "sessions": [...],
  "notes": [...]
}
```

- [ ] **Step 2: Test export/import cycle**

Export data → Clear browser storage → Import data → Verify sessions and notes are restored.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/ && git commit -m "feat: add settings page with TTS config and data export/import"
```

---

## Task 27: Final Integration & Polish

**Files:** Various

- [ ] **Step 1: Test complete exam flow end-to-end**

1. Start exam mode for test-01
2. Complete Reading Part 1 (matching) → Part 2 (MC) → Part 3 (matching)
3. Complete Sprachbausteine Part 1 (cloze MC) → Part 2 (cloze wordbank)
4. Timer shared across Reading+Sprachbausteine
5. Complete Listening with TTS
6. Complete Writing
7. Complete Speaking
8. Submit → Results page
9. Verify scores are correct
10. Check session appears in Sessions page
11. Check notes created during test appear in Notes page

- [ ] **Step 2: Test practice mode**

Same as above but untimed, sections in any order, pause/resume.

- [ ] **Step 3: Test responsive layout**

Check all pages at 375px (mobile) and 1280px (desktop). Verify bottom tab bar on mobile, sidebar on desktop.

- [ ] **Step 4: Test dark mode**

Toggle theme, verify all pages render correctly in both modes.

- [ ] **Step 5: Test edge cases**

- Open app in incognito (no data) — verify empty states
- Close browser mid-test, reopen — verify session resumes
- Test with TTS disabled (Firefox private mode) — verify transcript fallback

- [ ] **Step 6: Build static export**

```bash
npm run build
```
Verify no build errors.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: polish and verify complete exam practice flow"
```

---

## Summary

| Task | Component | Est. Steps |
|------|-----------|------------|
| 1 | Project scaffolding | 6 |
| 2 | Types & constants | 4 |
| 3 | Database layer | 3 |
| 4 | Scoring logic (TDD) | 5 |
| 5 | TTS wrapper | 2 |
| 6 | Test content (3 JSON files) | 5 |
| 7 | Theme + layout + nav | 8 |
| 8 | Dashboard page (with stats) | 3 |
| 9 | Test overview page | 4 |
| 10 | MultipleChoice component | 3 |
| 11 | Matching component | 2 |
| 12 | TrueFalse component | 2 |
| 13 | ClozeDropdown component | 2 |
| 14 | ClozeWordbank component | 2 |
| 15 | WritingTask + SpeakingTask | 3 |
| 16 | ListeningPlayer | 2 |
| 17 | Timer hook (TDD) | 5 |
| 18 | Timer display | 2 |
| 19 | Session hook | 2 |
| 20 | Notes hook + panel | 3 |
| 21 | Exercise view page | 4 |
| 22 | Review components | 3 |
| 23 | Results page | 3 |
| 24 | Sessions page | 2 |
| 25 | Notes page | 2 |
| 26 | Settings + export/import | 3 |
| 27 | Integration & polish | 7 |
| **Total** | | **92 steps** |
