"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Login failed");
        return;
      }

      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h1 className="card-title">Welcome back</h1>
      <p className="meta">Enter the shared password to access your vocabulary app.</p>
      <div style={{ marginTop: "0.75rem" }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="exercise-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Enter"}
        </button>
      </div>
    </form>
  );
}
