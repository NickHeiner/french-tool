"use client";

import { useState } from "react";

type GenerateMoreButtonProps = {
  wordId: string;
};

export function GenerateMoreButton({ wordId }: GenerateMoreButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generateMore() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/words/${wordId}/generate-more`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ perType: 3 }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage(payload?.error ?? "Could not queue exercises");
        return;
      }

      setMessage("Exercise generation queued. Refresh in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="exercise-actions">
      <button type="button" onClick={generateMore} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate more exercises"}
      </button>
      {message ? <p className="meta">{message}</p> : null}
    </div>
  );
}
