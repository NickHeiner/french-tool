import { task } from "@trigger.dev/sdk";
import { neon } from "@neondatabase/serverless";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are helping a French learner at CEFR B1 level. They are conversational but rusty — they studied French academically from 7th grade through the first semester of college, forgot a lot of it, and have been taking periodic lessons to get it back. They can hold a conversation with their teacher but rely on some crutches.

Example sentences should use common vocabulary and straightforward grammar, but don't dumb it down to tourist-phrase level. Do include subjunctive, conditional, and simple future tenses — the user is actively working on these. Avoid complex literary tenses (passé simple, plus-que-parfait du subjonctif) and business/technical jargon unless the target word specifically calls for it.`;

export const generateExercises = task({
  id: "generate-exercises",
  run: async (payload: { wordId: string; french: string; english: string }) => {
    const sql = neon(process.env.DATABASE_URL!);
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate exercises for the French word/phrase: "${payload.french}" (English: "${payload.english}")

Generate exactly 9 exercises: 3 of each type. Return a JSON array with objects having these fields:
- "type": one of "fill_blank", "context_guess", or "sentence_construction"
- "prompt": the exercise prompt shown to the user
- "answer": the correct answer (null for sentence_construction since those are evaluated live)

For fill_blank: Create a French sentence with "___" where the target word should go. The answer is the missing word/phrase.
For context_guess: Write a French sentence using the word naturally. The prompt is the sentence. The answer is the English meaning with a brief explanation of how it's used in context.
For sentence_construction: Create a prompt like "Use [word] in a sentence about [specific topic]." The answer should be null.

Return ONLY the JSON array, no markdown formatting or code blocks.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    let exercises;
    try {
      exercises = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        exercises = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse exercises response: ${text}`);
      }
    }

    for (const exercise of exercises) {
      await sql`
        INSERT INTO exercises (word_id, type, prompt, answer)
        VALUES (
          ${payload.wordId}::uuid,
          ${exercise.type},
          ${exercise.prompt},
          ${exercise.answer}
        )
      `;
    }

    return { success: true, wordId: payload.wordId, count: exercises.length };
  },
});
