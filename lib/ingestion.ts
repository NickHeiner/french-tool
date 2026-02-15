
import { env, getQuizletSetId } from "@/lib/env";
import { fetchQuizletCards } from "@/lib/quizlet";
import { insertWords, listWordsForSet } from "@/lib/words";

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function ingestQuizletWords(): Promise<{
  setId: string;
  fetchedCount: number;
  insertedCount: number;
  insertedWords: Array<{ id: string; french: string; english: string }>;
}> {
  const setId = getQuizletSetId();
  const cards = await fetchQuizletCards(env.quizletSetUrl);

  const deduped = new Map<string, { french: string; english: string }>();
  for (const card of cards) {
    const french = normalize(card.french);
    const english = normalize(card.english);
    if (!french || !english) {
      continue;
    }

    const key = `${french.toLowerCase()}::${english.toLowerCase()}`;
    if (!deduped.has(key)) {
      deduped.set(key, { french, english });
    }
  }

  const existingRows = await listWordsForSet(setId);
  const existingKeys = new Set(
    existingRows.map((row) => `${row.french.toLowerCase()}::${row.english.toLowerCase()}`),
  );

  const candidates = [...deduped.values()].filter(
    (row) => !existingKeys.has(`${row.french.toLowerCase()}::${row.english.toLowerCase()}`),
  );

  const insertedWords = await insertWords(setId, candidates);

  return {
    setId,
    fetchedCount: deduped.size,
    insertedCount: insertedWords.length,
    insertedWords,
  };
}
