import Link from "next/link";
import { getTestById, getAllTestIds } from "@/lib/tests";
import { notFound } from "next/navigation";
import type { MockTest } from "@/lib/types";

export async function generateStaticParams() {
  const testIds = getAllTestIds();
  return testIds.map((id) => ({ id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TestOverviewPage({ params }: Props) {
  const { id } = await params;

  let test: MockTest;
  try {
    test = getTestById(id);
  } catch {
    notFound();
  }

  const sections = [
    { name: "Reading", key: "reading", parts: ["part1", "part2", "part3"] },
    { name: "Sprachbausteine", key: "sprachbausteine", parts: ["part1", "part2"] },
    { name: "Listening", key: "listening", parts: ["part1", "part2", "part3"] },
    { name: "Writing", key: "writing", parts: ["task"] },
    { name: "Speaking", key: "speaking", parts: ["part1", "part2", "part3"] },
  ];

  const totalExercises = sections.reduce((sum, section) => {
    const sectionData = test[section.key as keyof MockTest];
    return sum + section.parts.length;
  }, 0);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Level: {test.level}</p>
      </div>

      {/* Test Sections */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Test Sections</h2>
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{section.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {section.parts.length} part{section.parts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {section.parts.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Exercises</p>
            <p className="text-3xl font-bold mt-1">{totalExercises}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Duration</p>
            <p className="text-lg font-semibold mt-1">~180 minutes</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex gap-3 pt-4">
        <Link
          href={`/test/${test.id}/exercise`}
          className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 text-center transition-colors"
        >
          Start Test
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold py-3 px-6 text-center transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
