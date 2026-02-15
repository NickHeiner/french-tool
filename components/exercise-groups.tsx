"use client";

import { useMemo, useState } from "react";

import type { Exercise, SentenceFeedback } from "@/lib/types";

type ExerciseGroupsProps = {
  exercises: Exercise[];
};

type FeedbackMap = Record<string, SentenceFeedback | undefined>;

export function ExerciseGroups({ exercises }: ExerciseGroupsProps) {
  const grouped = useMemo(
    () => ({
      fill_blank: exercises.filter((exercise) => exercise.type === "fill_blank"),
      context_guess: exercises.filter((exercise) => exercise.type === "context_guess"),
      sentence_construction: exercises.filter((exercise) => exercise.type === "sentence_construction"),
    }),
    [exercises],
  );

  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({});
  const [feedbackByExercise, setFeedbackByExercise] = useState<FeedbackMap>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  function toggleReveal(exerciseId: string) {
    setRevealedAnswers((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }));
  }

  async function submitAttempt(exerciseId: string) {
    const userInput = draftInputs[exerciseId]?.trim();
    if (!userInput) {
      return;
    }

    setSubmittingId(exerciseId);

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/attempt`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { feedback?: SentenceFeedback; error?: string }
        | null;

      if (!response.ok || !payload?.feedback) {
        throw new Error(payload?.error ?? "Could not evaluate sentence");
      }

      setFeedbackByExercise((current) => ({
        ...current,
        [exerciseId]: payload.feedback,
      }));
    } catch (error) {
      setFeedbackByExercise((current) => ({
        ...current,
        [exerciseId]: {
          verdict: "needs_work",
          grammarNotes: [],
          naturalnessNotes: [],
          summary: error instanceof Error ? error.message : "Could not evaluate sentence",
        },
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <>
      <h2 className="section-title">Fill in the Blank</h2>
      {grouped.fill_blank.map((exercise) => (
        <article key={exercise.id} className="card">
          <p>{exercise.prompt}</p>
          <div className="exercise-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => toggleReveal(exercise.id)}
            >
              {revealedAnswers[exercise.id] ? "Hide answer" : "Reveal answer"}
            </button>
          </div>
          {revealedAnswers[exercise.id] ? (
            <div className="answer-panel">
              <strong>Answer:</strong> {exercise.answer}
            </div>
          ) : null}
        </article>
      ))}

      <h2 className="section-title">Context Guessing</h2>
      {grouped.context_guess.map((exercise) => (
        <article key={exercise.id} className="card">
          <p>{exercise.prompt}</p>
          <div className="exercise-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => toggleReveal(exercise.id)}
            >
              {revealedAnswers[exercise.id] ? "Hide meaning" : "Reveal meaning"}
            </button>
          </div>
          {revealedAnswers[exercise.id] ? (
            <div className="answer-panel">{exercise.answer}</div>
          ) : null}
        </article>
      ))}

      <h2 className="section-title">Sentence Construction</h2>
      {grouped.sentence_construction.map((exercise) => {
        const feedback = feedbackByExercise[exercise.id];

        return (
          <article key={exercise.id} className="card">
            <p>{exercise.prompt}</p>
            <textarea
              value={draftInputs[exercise.id] ?? ""}
              onChange={(event) =>
                setDraftInputs((current) => ({
                  ...current,
                  [exercise.id]: event.target.value,
                }))
              }
              placeholder="Write your French sentence"
            />
            <div className="exercise-actions">
              <button
                type="button"
                onClick={() => submitAttempt(exercise.id)}
                disabled={submittingId === exercise.id}
              >
                {submittingId === exercise.id ? "Evaluating..." : "Submit"}
              </button>
            </div>
            {feedback ? (
              <div className="answer-panel">
                <p>
                  <strong>{feedback.verdict === "correct" ? "Correct" : "Needs work"}</strong> -{" "}
                  {feedback.summary}
                </p>
                {feedback.correctedSentence ? (
                  <p>
                    <strong>Suggested correction:</strong> {feedback.correctedSentence}
                  </p>
                ) : null}
                {feedback.grammarNotes.length > 0 ? (
                  <p>
                    <strong>Grammar:</strong> {feedback.grammarNotes.join(" ")}
                  </p>
                ) : null}
                {feedback.naturalnessNotes.length > 0 ? (
                  <p>
                    <strong>Naturalness:</strong> {feedback.naturalnessNotes.join(" ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </>
  );
}
