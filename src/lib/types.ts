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
