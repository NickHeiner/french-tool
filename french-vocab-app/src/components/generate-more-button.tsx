"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateMoreButton({ wordId }: { wordId: string }) {
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });

      if (res.ok) {
        setTriggered(true);
        // Refresh after a delay to show new exercises
        setTimeout(() => router.refresh(), 5000);
      }
    } catch (error) {
      console.error("Failed to generate more exercises:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || triggered}
      className="btn-secondary w-full"
    >
      {loading
        ? "Requesting..."
        : triggered
        ? "Generating... (refresh in a moment)"
        : "Generate more exercises"}
    </button>
  );
}
