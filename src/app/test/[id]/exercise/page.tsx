import { getTestById, getAllTestIds } from "@/lib/tests";
import { notFound } from "next/navigation";
import { ExerciseViewClient } from "./ExerciseViewClient";
import type { MockTest } from "@/lib/types";

export async function generateStaticParams() {
  const testIds = getAllTestIds();
  return testIds.map((id) => ({ id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExerciseViewPage({ params }: Props) {
  const { id } = await params;

  let test: MockTest;
  try {
    test = getTestById(id);
  } catch {
    notFound();
  }

  return <ExerciseViewClient test={test} testId={id} />;
}
