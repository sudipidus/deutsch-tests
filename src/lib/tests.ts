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
