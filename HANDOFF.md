# Handoff: Task 13 - Exercise View Page

**Current Status**: 12/16 tasks complete. 4 new tasks completed in this session!

## Quick Context
- Project: telc Deutsch B1 practice app (German language testing)
- Stack: Next.js, TypeScript, Tailwind, Dexie.js, Jest
- Latest commits: Tasks 9-12 completed (test overview, exercises, timer, session/notes)

## What's Built (Tasks 1-12) ✅
✅ Project scaffolding + TypeScript setup
✅ Database schema (Dexie.js)
✅ Scoring logic (with tests)
✅ TTS wrapper (German voice)
✅ Mock test JSON (3 files: reading, listening, writing)
✅ Layout + responsive nav + theme toggle
✅ Dashboard page (test list + recent sessions)
✅ Test overview page (Task 9)
✅ 7 exercise components (Task 10):
   - MatchingExercise
   - MultipleChoiceExercise
   - TrueFalseExercise
   - ClozeMCExercise
   - ClozeWordbankExercise
   - WritingTask
   - SpeakingTask
✅ useTimer hook + TimerDisplay (Task 11)
✅ useSession, useNotes hooks + SessionPanel (Task 12)

## Architecture
```
src/
├── app/
│   ├── page.tsx               (Dashboard - done)
│   ├── test/[id]/page.tsx     (Test overview - done)
│   ├── test/[id]/exercise/    (Exercise view - Task 13)
│   ├── test/[id]/review/      (Results - Task 14)
│   ├── sessions/              (Sessions list - Task 15)
│   └── settings/              (Settings page - Task 15)
├── components/
│   ├── exercise/              (7 components - done)
│   ├── review/                (3 components - Task 14)
│   └── shared/
│       ├── TimerDisplay.tsx   (done)
│       └── SessionPanel.tsx   (done)
├── hooks/
│   ├── useTimer.ts            (done)
│   ├── useSession.ts          (done)
│   ├── useNotes.ts            (done)
│   └── useSettings.ts         (existing)
├── lib/
│   ├── tts.ts                 (German voices)
│   ├── scoring.ts             (with tests)
│   ├── types.ts               (all TypeScript)
│   ├── constants.ts           (UI strings)
│   └── tests.ts               (test loader)
└── db/
    └── index.ts               (Dexie schema)
```

## Next Task: Task 13 - Exercise View Page

**Goal**: Main orchestrator page that routes through exercise components, manages answers, and controls flow.

**Location**: `src/app/test/[id]/exercise/page.tsx`

**Must-Have Features**:
1. Load test by ID via getTestById()
2. Initialize session with useSession hook
3. Map test structure to exercise components dynamically
4. Track current position (section + part)
5. Handle answer changes and save to session
6. Display TimerDisplay component (180 min for full test)
7. Show SessionPanel for notes (toggleable side panel)
8. Navigation controls:
   - "Previous" button (disabled on first)
   - "Next" button (validates current part, saves answers)
   - "Submit" button (final submission → review page)
9. Progress indicator (e.g., "Reading Part 1 of 3")
10. Link to review page on completion

**Data Structure to Track**:
```typescript
- currentSection: "reading" | "sprachbausteine" | "listening" | "writing" | "speaking"
- currentPartIndex: 0-2 (most sections have 2-3 parts)
- sectionOrder: ["reading", "sprachbausteine", "listening", "writing", "speaking"]
- answers: stored in session.sections[section][part].answers
```

**Component Routing Logic**:
```typescript
// Pseudo-code for router
const exerciseComponent = {
  reading: { part1: MatchingExercise, part2: MultipleChoiceExercise, part3: MatchingExercise },
  sprachbausteine: { part1: ClozeMCExercise, part2: ClozeWordbankExercise },
  listening: { part1: TrueFalseExercise, part2: TrueFalseExercise, part3: MatchingExercise },
  writing: { task: WritingTask },
  speaking: { part1: SpeakingTask, part2: SpeakingTask, part3: SpeakingTask },
}
```

## Remaining Tasks (4/4)
- **Task 13**: Exercise view page (core orchestrator) ← NEXT
- **Task 14**: Review components + results page
- **Task 15**: Sessions, notes, settings pages
- **Task 16**: Final integration & polish

## Git Status
- All 4 tasks (9-12) committed to main
- No uncommitted changes
- Build passes ✅

## For Next Session
Start Task 13 with: `git log --oneline -1` to verify latest commit, then build the exercise orchestrator.

---
**Updated**: 2026-06-10 (Session 2) | **By**: Claude Code | **Full Plan**: `/docs/superpowers/plans/2026-06-10-b1-practice-app.md`
