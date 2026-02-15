import { task } from "@trigger.dev/sdk/v3";

import { generateEnrichment, generateExercises } from "@/lib/llm";
import { getWordById, insertExercises, upsertEnrichment } from "@/lib/words";

export const generateEnrichmentTask = task({
  id: "generate-enrichment",
  run: async (payload: { wordId: string }) => {
    const word = await getWordById(payload.wordId);
    if (!word) {
      throw new Error(`Word not found for enrichment generation: ${payload.wordId}`);
    }

    const enrichment = await generateEnrichment({ french: word.french, english: word.english });
    await upsertEnrichment(word.id, enrichment);

    return {
      wordId: word.id,
      examples: enrichment.exampleSentences.length,
    };
  },
});

export const generateExercisesTask = task({
  id: "generate-exercises",
  run: async (payload: { wordId: string; perType?: number }) => {
    const word = await getWordById(payload.wordId);
    if (!word) {
      throw new Error(`Word not found for exercise generation: ${payload.wordId}`);
    }

    const perType = payload.perType && payload.perType > 0 ? Math.min(payload.perType, 6) : 3;
    const exercises = await generateExercises({ french: word.french, english: word.english }, perType);
    await insertExercises(word.id, exercises);

    return {
      wordId: word.id,
      inserted: exercises.length,
      perType,
    };
  },
});
