"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/db";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  if (exercise.type === "fill_blank") {
    return <FillBlankCard exercise={exercise} />;
  }
  if (exercise.type === "context_guess") {
    return <ContextGuessCard exercise={exercise} />;
  }
  if (exercise.type === "sentence_construction") {
    return <SentenceConstructionCard exercise={exercise} />;
  }
  return null;
}

function FillBlankCard({ exercise }: { exercise: Exercise }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="card">
      <p className="text-gray-800 leading-relaxed mb-3">{exercise.prompt}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer..."
          className="input-field flex-1"
          disabled={revealed}
        />
        <button
          onClick={() => setRevealed(true)}
          className="btn-secondary shrink-0"
        >
          {revealed ? "Answer" : "Reveal"}
        </button>
      </div>
      {revealed && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-900">
            Answer: {exercise.answer}
          </p>
          {userAnswer && (
            <p
              className={`mt-1 text-sm ${
                userAnswer.toLowerCase().trim() ===
                exercise.answer?.toLowerCase().trim()
                  ? "text-green-700"
                  : "text-orange-700"
              }`}
            >
              {userAnswer.toLowerCase().trim() ===
              exercise.answer?.toLowerCase().trim()
                ? "Correct!"
                : "Not quite. Compare your answer above."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ContextGuessCard({ exercise }: { exercise: Exercise }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="card">
      <p className="text-gray-800 leading-relaxed mb-3">{exercise.prompt}</p>
      <button
        onClick={() => setRevealed(!revealed)}
        className="btn-secondary w-full"
      >
        {revealed ? "Hide" : "Reveal meaning"}
      </button>
      {revealed && (
        <div className="mt-3 rounded-lg bg-green-50 p-3">
          <p className="text-sm text-green-900">{exercise.answer}</p>
        </div>
      )}
    </div>
  );
}

function SentenceConstructionCard({ exercise }: { exercise: Exercise }) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
    corrected_sentence: string | null;
    naturalness: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!userInput.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, userInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setUserInput("");
    setFeedback(null);
  }

  return (
    <div className="card">
      <p className="text-gray-800 leading-relaxed mb-3">{exercise.prompt}</p>
      <div className="space-y-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Write your sentence in French..."
          className="input-field min-h-[80px] resize-none"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !userInput.trim()}
            className="btn-primary flex-1"
          >
            {loading ? "Evaluating..." : "Submit"}
          </button>
          {feedback && (
            <button onClick={handleReset} className="btn-secondary">
              Try again
            </button>
          )}
        </div>
      </div>
      {feedback && (
        <div
          className={`mt-3 rounded-lg p-3 ${
            feedback.correct ? "bg-green-50" : "bg-orange-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold uppercase ${
                feedback.correct ? "text-green-700" : "text-orange-700"
              }`}
            >
              {feedback.correct ? "Correct" : "Needs work"}
            </span>
            <span className="text-xs text-gray-500">
              Naturalness: {feedback.naturalness}
            </span>
          </div>
          <p
            className={`text-sm ${
              feedback.correct ? "text-green-900" : "text-orange-900"
            }`}
          >
            {feedback.feedback}
          </p>
          {feedback.corrected_sentence && (
            <p className="mt-2 text-sm font-medium text-gray-800">
              Suggested: {feedback.corrected_sentence}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
