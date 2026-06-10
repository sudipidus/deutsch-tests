# telc Deutsch B1 Practice App — Design Spec

## Overview

A static web app for practicing the telc Deutsch B1 German language exam. Users work through complete mock tests that mirror the real exam format, save sessions locally, take notes, and track progress over time.

## Tech Stack

- **Framework:** Next.js 15 (App Router), static export
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB via Dexie.js (all data local to browser)
- **Language:** TypeScript
- **TTS:** Web Speech API (browser-native), with transcript fallback
- **Drag-and-drop:** `@hello-pangea/dnd` (touch-compatible, fork of react-beautiful-dnd)
- **Hosting:** Any static host (Vercel, GitHub Pages, local)

## Content Data Model

Each mock test is a single JSON file in `content/tests/`, named by its id (e.g., `test-01.json` where the file contains `"id": "test-01"`). Tests are discovered at build time — `generateStaticParams` reads `content/tests/*.json` to generate all routes. Adding a test requires adding a file and rebuilding.

```typescript
interface MockTest {
  id: string;
  title: string;
  level: "B1";
  reading: {
    part1: MatchingExercise;   // Match 5 headings to 5 short texts (10 heading options)
    part2: MultipleChoiceExercise; // Read long text, answer 5 MC questions
    part3: MatchingExercise;   // Match 10 situations to classified ads/notices
  };
  sprachbausteine: {
    part1: ClozeMCExercise;    // 10 blanks in text, 3 options each
    part2: ClozeWordbankExercise; // 10 blanks, 15-word bank
  };
  listening: {
    part1: TrueFalseExercise;  // 5 short dialogues, true/false each
    part2: TrueFalseExercise;  // 1 long dialogue, 10 true/false questions
    part3: MatchingExercise;   // 5 messages matched to situations
  };
  writing: {
    task: WritingTask;         // Prompt + 4 content points + model answer
  };
  speaking: {
    part1: SpeakingTask;       // Introduction prompts + model answer
    part2: SpeakingTask;       // Conversation topic + model answer
    part3: SpeakingTask;       // Problem-solving scenario + model answer
  };
}

interface MatchingExercise {
  type: "matching";
  instructions: string;
  items: { id: string; text: string }[];       // texts/situations
  options: { id: string; text: string }[];      // headings/ads (may have distractors)
  correctMatches: Record<string, string>;        // itemId -> optionId
}

interface MultipleChoiceExercise {
  type: "multiple-choice";
  text: string;               // reading passage
  questions: {
    prompt: string;
    options: { key: string; text: string }[];
    correct: string;          // key of correct option
  }[];
}

interface TrueFalseExercise {
  type: "true-false";
  dialogues: {
    transcript: string;       // used for TTS and transcript reveal
    questions: {
      prompt: string;
      correct: boolean;
    }[];
  }[];
}

interface ClozeMCExercise {
  type: "cloze-mc";
  text: string;               // text with {{1}}, {{2}} placeholders
  blanks: {
    id: string;
    options: string[];
    correct: string;
  }[];
}

interface ClozeWordbankExercise {
  type: "cloze-wordbank";
  text: string;               // text with {{1}}, {{2}} placeholders
  wordbank: string[];          // 15 words (5 distractors)
  correctFills: Record<string, string>; // blankId -> word
}

interface WritingTask {
  prompt: string;
  situation: string;
  contentPoints: string[];     // 4 points to address
  modelAnswer: string;
}

interface SpeakingTask {
  instructions: string;
  prompts: string[];
  modelAnswer: string;
  checklist: string[];         // self-assessment items
}
```

## App Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard: available tests, recent sessions, quick stats |
| `/test/[id]` | Test overview: section cards with status, start full or pick section |
| `/test/[id]/[section]/[part]` | Exercise view: question display, answer input, timer, notes panel |
| `/sessions` | Session history: past attempts, scores, filters, click to review |
| `/notes` | Notes manager: all notes searchable, tagged, create standalone |
| `/settings` | Preferences: TTS voice/speed, timer on/off, theme, data export/import |

### Exercise Components

Each question type has a dedicated component:

- **MultipleChoice** — radio buttons, scrollable passage above
- **Matching** — two columns, click-to-pair interaction (tap-to-select on mobile)
- **TrueFalse** — richtig/falsch radio buttons per statement
- **ClozeDropdown** — inline dropdowns in text (Sprachbausteine Part 1)
- **ClozeWordbank** — draggable word bank with drop targets via `@hello-pangea/dnd` (touch-compatible); tap-to-select fallback on mobile
- **WritingTask** — prompt + content points + textarea with word count
- **SpeakingTask** — prompts + textarea for notes + self-assessment checklist
- **ListeningPlayer** — TTS playback controls with "show transcript" toggle; if TTS unavailable, auto-falls back to transcript-only mode

### Exam Flow (No Mid-Test Feedback)

1. User starts a test (full or single section)
2. During the test: no feedback. Answers auto-save to IndexedDB silently. User navigates freely between parts within the current section.
3. Submit: confirmation dialog ("Are you sure? You won't be able to change answers."). Timer auto-submits the current section when time expires.
4. After submission: results page with full breakdown — score summary, then question-by-question review with correct/incorrect highlighting.

### Two Modes

- **Exam mode** — timed, sections must be completed in order (Reading+Sprachbausteine -> Listening -> Writing -> Speaking). Timer counts down per section block. Auto-submit on expiry. Cannot return to a submitted section.
- **Practice mode** — untimed. No mid-test feedback still. Sections can be done in any order. Pause/resume freely.

### Timer Rules

| Section Block | Duration | Scope |
|---------------|----------|-------|
| Reading + Sprachbausteine | 90 min | Single shared timer. User can freely navigate between Reading Parts 1-3 and Sprachbausteine Parts 1-2. Auto-submits all 5 parts when time expires. |
| Listening | 30 min | Fixed timer. TTS playback time counts against it. Auto-submits all 3 parts on expiry. |
| Writing | 30 min | Single timer for the one writing task. Auto-submits on expiry. |
| Speaking | Untimed | Self-paced, no timer. Self-review only. |

In exam mode, completing (or auto-submitting) one section block unlocks the next. In practice mode, all sections are unlocked from the start.

## Local Storage (IndexedDB via Dexie.js)

### Tables

**sessions:**

```typescript
interface Session {
  id?: number;                // auto-increment
  testId: string;
  mode: "exam" | "practice";
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
  status: "in-progress" | "completed";
  sections: {
    reading: {
      part1: SectionPartState<Record<string, string>>;  // itemId -> optionId
      part2: SectionPartState<Record<number, string>>;   // questionIndex -> selected key
      part3: SectionPartState<Record<string, string>>;  // itemId -> optionId
    };
    sprachbausteine: {
      part1: SectionPartState<Record<string, string>>;  // blankId -> selected option
      part2: SectionPartState<Record<string, string>>;  // blankId -> selected word
    };
    listening: {
      part1: SectionPartState<Record<number, boolean>>; // questionIndex -> true/false
      part2: SectionPartState<Record<number, boolean>>;
      part3: SectionPartState<Record<string, string>>;  // itemId -> optionId
    };
    writing: {
      task: SectionPartState<string>;                    // the written text
    };
    speaking: {
      part1: SectionPartState<SpeakingAnswer>;
      part2: SectionPartState<SpeakingAnswer>;
      part3: SectionPartState<SpeakingAnswer>;
    };
  };
  timeSpent: Record<string, number>;  // sectionBlock -> seconds elapsed
}

interface SectionPartState<T> {
  answers: T;
  score: number | null;       // null until submitted
  completedAt: Date | null;
}

interface SpeakingAnswer {
  notes: string;              // user's preparation notes
  selfAssessment: Record<string, boolean>;  // checklist item -> checked
}
```

**notes:**
- id (auto-increment)
- sessionId (nullable for standalone notes)
- testId, section, part, questionIndex (all nullable for context linking)
- content (text)
- tags: string[]
- createdAt, updatedAt

**settings:**
- ttsVoice, ttsSpeed
- timerEnabled: boolean
- theme: "light" | "dark"

### Behaviors

- Every answer change triggers immediate IndexedDB write
- Sessions track per-section completion independently
- Notes linkable to specific questions or standalone
- Scores computed on submission and stored

## Review & Scoring

### After Submission

- Per-question review: your answer vs correct answer, color-coded (green/red)
- Matching: paired items highlighted
- Cloze: your word shown, correct word if different
- Writing: your text side-by-side with model answer, content points checklist (self-review)
- Speaking: model answer revealed, self-assessment checklist (self-review)

### Scoring (telc weights)

| Section | Points | Per-question |
|---------|--------|--------------|
| Reading Part 1 (5 items) | 25 | 5 each |
| Reading Part 2 (5 questions) | 25 | 5 each |
| Reading Part 3 (10 items) | 25 | 2.5 each |
| Sprachbausteine Part 1 (10 blanks) | 15 | 1.5 each |
| Sprachbausteine Part 2 (10 blanks) | 15 | 1.5 each |
| Listening Part 1 (5 items) | 25 | 5 each |
| Listening Part 2 (10 items) | 25 | 2.5 each |
| Listening Part 3 (5 items) | 25 | 5 each |
| **Scored subtotal** | **180** | |
| Writing (self-review only) | — | Not auto-scored |
| Speaking (self-review only) | — | Not auto-scored |

**Pass threshold:** 60% of the 180 scored points = 108 points.

Writing and Speaking are **self-review only** in v1 — the app shows model answers and self-assessment checklists but does not assign numeric scores. The dashboard pass/fail is based on the auto-scored sections only. This is clearly communicated in the UI.

### Dashboard Stats

- Per-test score with pass/fail (auto-scored sections only)
- Per-section breakdown with visual bars
- Writing/Speaking shown as "completed" or "not attempted" (no numeric score)
- Trend tracking across multiple attempts of the same test

## UI Design

- **Aesthetic:** Study-tool (Notion/Anki-like) — clean, functional, good information hierarchy
- **Responsive:** Works equally well on desktop and mobile
- **Theme:** Light and dark mode
- **Navigation:** Sidebar on desktop, bottom tab bar on mobile
- **Notes panel:** Slide-out sidebar accessible during exercises
- **Accessibility:** Follow WCAG 2.1 AA — keyboard navigation, focus management, ARIA labels on interactive elements, sufficient color contrast
- **Future (v2):** Gamification — progress bars, streaks, badges, XP

## Edge Cases & Error States

- **No tests available:** Dashboard shows empty state with message: "No mock tests found. Add JSON test files to content/tests/ and rebuild."
- **No sessions yet:** Dashboard shows welcome message with prompt to start first test.
- **TTS unavailable:** ListeningPlayer detects missing Web Speech API support and falls back to transcript-only mode with a notice: "Audio not available on this browser. Read the transcript below."
- **Corrupted/partial session:** If a session record loads with missing fields, show it as "incomplete" in session history with option to delete. Do not crash.
- **Browser storage cleared:** Sessions/notes gone — show empty state gracefully. No error.

## Data Export/Import

Available in `/settings`:

- **Export:** Download all sessions and notes as a single JSON file
- **Import:** Upload a previously exported JSON file, with confirmation dialog showing how many sessions/notes will be imported. Merge strategy: skip duplicates by id, add new records.

This protects against browser storage being cleared and allows moving data between devices.

## Project Structure

```
b1/
├── content/tests/           # JSON mock test files (test-01.json, test-02.json, ...)
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/
│   │   ├── exercises/       # One component per question type
│   │   ├── layout/          # Nav, Timer, NotesPanel
│   │   └── review/          # ScoreSummary, AnswerReview
│   ├── lib/                 # db.ts, tts.ts, scoring.ts, types.ts
│   └── hooks/               # useSession, useTimer, useNotes
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

## Content Volume

- **v1:** 3-5 complete mock tests covering all sections
- **Extensible:** Add new tests by dropping JSON files in `content/tests/` and rebuilding
- Questions written in German at B1 level, covering everyday/professional scenarios per telc guidelines

## Known Limitations (v1)

- **TTS quality varies by browser/OS.** German voices may sound robotic on some systems. Transcript fallback is always available. Pre-generated audio files are a v2 consideration.
- **Writing and Speaking are not auto-scored.** Self-review with model answers only.
- **Static export requires rebuild** to pick up new test files.

## Out of Scope (v1)

- User authentication / cloud sync
- Gamification (streaks, badges, XP)
- Pre-recorded audio files for listening
- AI-powered writing evaluation
- Multiplayer speaking practice