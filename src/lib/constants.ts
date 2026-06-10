import { SectionBlock } from "./types";

export const TIMER_DURATIONS: Record<SectionBlock, number | null> = {
  "reading-sprachbausteine": 90 * 60,
  listening: 30 * 60,
  writing: 30 * 60,
  speaking: null,
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
