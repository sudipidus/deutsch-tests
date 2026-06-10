"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useTimer } from "@/hooks/useTimer";
import { TimerDisplay } from "@/components/shared/TimerDisplay";
import { SessionPanel } from "@/components/shared/SessionPanel";
import {
  MatchingExercise,
  MultipleChoiceExercise,
  TrueFalseExercise,
  ClozeMCExercise,
  ClozeWordbankExercise,
  WritingTask,
  SpeakingTask,
} from "@/components/exercise";
import type { MockTest } from "@/lib/types";

interface ExerciseRoute {
  section: string;
  part: string;
  exercise: any;
  componentType: string;
}

interface Props {
  test: MockTest;
  testId: string;
}

export function ExerciseViewClient({ test, testId }: Props) {
  const router = useRouter();
  const { session, loading: sessionLoading, updateSession } = useSession(testId);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [routes, setRoutes] = useState<ExerciseRoute[]>([]);

  const { formatted, isRunning, start, pause, reset } = useTimer({
    initialSeconds: 180 * 60,
    autoStart: false,
  });

  // Build exercise routes
  useEffect(() => {
    const exerciseRoutes: ExerciseRoute[] = [];
    const sectionOrder = ["reading", "sprachbausteine", "listening", "writing", "speaking"];

    sectionOrder.forEach((section) => {
      const sectionData = test[section as keyof MockTest] as any;
      const partKeys = Object.keys(sectionData || {});

      partKeys.forEach((part) => {
        const exercise = sectionData[part];
        let componentType = "unknown";

        // Determine component type
        if (exercise?.type === "matching") componentType = "MatchingExercise";
        else if (exercise?.type === "multiple-choice") componentType = "MultipleChoiceExercise";
        else if (exercise?.type === "true-false") componentType = "TrueFalseExercise";
        else if (exercise?.type === "cloze-mc") componentType = "ClozeMCExercise";
        else if (exercise?.type === "cloze-wordbank") componentType = "ClozeWordbankExercise";
        else if (part === "task" && section === "writing") componentType = "WritingTask";
        else if (section === "speaking") componentType = "SpeakingTask";

        exerciseRoutes.push({ section, part, exercise, componentType });
      });
    });

    setRoutes(exerciseRoutes);
  }, [test]);

  if (sessionLoading || routes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading exercise...</p>
      </div>
    );
  }

  const currentRoute = routes[currentSectionIdx];
  const totalParts = routes.length;
  const currentPartNum = currentSectionIdx + 1;
  const isLastPart = currentPartNum === totalParts;

  const handleAnswerChange = (itemId: string | number, value: any) => {
    if (!session) return;

    const newSession = JSON.parse(JSON.stringify(session));
    const sectionData = (newSession.sections as any)[currentRoute.section];
    const partData = sectionData[currentRoute.part];

    if (currentRoute.componentType === "WritingTask" || currentRoute.componentType === "SpeakingTask") {
      partData.answers = value;
    } else {
      partData.answers[itemId] = value;
    }

    updateSession(newSession);
  };

  const handleNext = async () => {
    if (isLastPart) {
      if (session) {
        const completedSession = {
          ...session,
          completedAt: new Date(),
          status: "completed" as const,
        };
        await updateSession(completedSession);
      }
      router.push(`/test/${testId}/review`);
    } else {
      setCurrentSectionIdx(currentSectionIdx + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPartNum === 1) return;
    setCurrentSectionIdx(currentSectionIdx - 1);
    window.scrollTo(0, 0);
  };

  // Render the appropriate exercise component
  const renderExercise = () => {
    if (!session) return <p>Loading...</p>;
    const sections = session.sections as any;
    const answers = sections[currentRoute.section][currentRoute.part].answers || {};

    const sharedProps = { answers, onAnswerChange: handleAnswerChange };

    switch (currentRoute.componentType) {
      case "MatchingExercise":
        return <MatchingExercise exercise={currentRoute.exercise} {...sharedProps} />;
      case "MultipleChoiceExercise":
        return <MultipleChoiceExercise exercise={currentRoute.exercise} {...sharedProps} />;
      case "TrueFalseExercise":
        return <TrueFalseExercise exercise={currentRoute.exercise} {...sharedProps} />;
      case "ClozeMCExercise":
        return <ClozeMCExercise exercise={currentRoute.exercise} {...sharedProps} />;
      case "ClozeWordbankExercise":
        return <ClozeWordbankExercise exercise={currentRoute.exercise} {...sharedProps} />;
      case "WritingTask":
        return (
          <WritingTask
            exercise={currentRoute.exercise}
            answer={answers as string}
            onAnswerChange={(value) => handleAnswerChange("task", value)}
          />
        );
      case "SpeakingTask":
        return (
          <SpeakingTask
            exercise={currentRoute.exercise}
            answer={answers}
            onAnswerChange={(value) => handleAnswerChange("task", value)}
          />
        );
      default:
        return <p>Unknown exercise type</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentRoute.section.charAt(0).toUpperCase() + currentRoute.section.slice(1)} •{" "}
            {currentRoute.part.charAt(0).toUpperCase() + currentRoute.part.slice(1)} ({currentPartNum}/{totalParts})
          </p>
        </div>
        <TimerDisplay formatted={formatted} isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
      </div>

      <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentPartNum}/{totalParts}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${(currentPartNum / totalParts) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {renderExercise()}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentPartNum === 1}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-2 px-4 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition-colors"
        >
          {isLastPart ? "Submit & Review" : "Next →"}
        </button>
      </div>

      <SessionPanel sessionId={session?.id} testId={testId} />
    </div>
  );
}
