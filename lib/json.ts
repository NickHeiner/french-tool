export function parseJsonObject<T>(rawText: string): T {
  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}$/);
    if (!match) {
      throw new Error("Model did not return JSON");
    }

    return JSON.parse(match[0]) as T;
  }
}
