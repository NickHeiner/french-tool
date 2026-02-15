"use client";

import { useState } from "react";

import type { Exercise, SentenceFeedback } from "@/lib/types";

type PracticeExercise = Exercise & {
  french: string;
  english: string;
};

type PracticeDeckProps = {
  exercises: PracticeExercise[];
};

export function PracticeDeck({ exercises }: PracticeDeckProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (exercises.length === 0) {
    return <div className="card">No exercises available yet.</div>;
  }

  const current = exercises[index];

  function move(delta: number) {
    const nextIndex = (index + delta + exercises.length) % exercises.length;
    setIndex(nextIndex);
    setRevealed(false);
    setInput("");
    setFeedback(null);
  }

  async function submitSentence() {
    if (!input.trim() || current.type !== "sentence_construction") {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/exercises/${current.id}/attempt`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userInput: input.trim() }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { feedback?: SentenceFeedback; error?: string }
        | null;

      if (!response.ok || !payload?.feedback) {
        throw new Error(payload?.error ?? "Could not evaluate sentence");
      }

      setFeedback(payload.feedback);
    } catch (error) {
      setFeedback({
        verdict: "needs_work",
        correctedSentence: undefined,
        grammarNotes: [],
        naturalnessNotes: [],
        summary: error instanceof Error ? error.message : "Could not evaluate sentence",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card">
      <p className="meta">
        {index + 1}/{exercises.length} • {current.french} → {current.english}
      </p>
      <p>{current.prompt}</p>

      {current.type === "sentence_construction" ? (
        <>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Write your sentence"
          />
          <div className="exercise-actions">
            <button type="button" onClick={submitSentence} disabled={isSubmitting}>
              {isSubmitting ? "Evaluating..." : "Submit"}
            </button>
          </div>
          {feedback ? (
            <div className="answer-panel">
              <p>{feedback.summary}</p>
              {feedback.correctedSentence ? <p>{feedback.correctedSentence}</p> : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="exercise-actions">
            <button type="button" className="secondary" onClick={() => setRevealed((value) => !value)}>
              {revealed ? "Hide answer" : "Reveal answer"}
            </button>
          </div>
          {revealed ? <div className="answer-panel">{current.answer}</div> : null}
        </>
      )}

      <div className="exercise-actions">
        <button type="button" className="secondary" onClick={() => move(-1)}>
          Previous
        </button>
        <button type="button" onClick={() => move(1)}>
          Next
        </button>
      </div>
    </section>
  );
}
