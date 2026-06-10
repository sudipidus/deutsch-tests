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
