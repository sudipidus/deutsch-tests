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
