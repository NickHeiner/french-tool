"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/db";
import { ExerciseCard } from "./exercise-card";

type ExerciseWithWord = Exercise & { french: string; english: string };

export function PracticeView({
  exercises,
}: {
  exercises: ExerciseWithWord[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const exercise = exercises[currentIndex];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {exercises.length}
          </span>
          <span className="text-xs font-medium text-gray-400 uppercase">
            {exercise.type.replace("_", " ")}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / exercises.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        Word: <span className="font-medium">{exercise.french}</span> &mdash;{" "}
        {exercise.english}
      </div>

      <ExerciseCard exercise={exercise} />

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary flex-1"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentIndex(Math.min(exercises.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === exercises.length - 1}
          className="btn-primary flex-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
