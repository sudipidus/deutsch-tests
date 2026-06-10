import { Suspense } from "react";
import { getTestById, getAllTestIds } from "@/lib/tests";
import { notFound } from "next/navigation";
import { ReviewClient } from "./ReviewClient";

export async function generateStaticParams() {
  const testIds = getAllTestIds();
  return testIds.map((id) => ({ id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;

  let test;
  try {
    test = getTestById(id);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<p className="text-gray-600 dark:text-gray-400">Loading results...</p>}>
      <ReviewClient test={test} testId={id} />
    </Suspense>
  );
}
