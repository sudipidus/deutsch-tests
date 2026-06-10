import { getTestById, getAllTestIds } from "@/lib/tests";
import { notFound } from "next/navigation";
import { ExerciseViewClient } from "./ExerciseViewClient";
import type { MockTest } from "@/lib/types";

export async function generateStaticParams() {
  const testIds = getAllTestIds();
  return testIds.map((id) => ({ id }));
}

interface Props {
  params: { id: string };
}

export default function ExerciseViewPage({ params }: Props) {
  let test: MockTest;
  try {
    test = getTestById(params.id);
  } catch {
    notFound();
  }

  return <ExerciseViewClient test={test} testId={params.id} />;
}
