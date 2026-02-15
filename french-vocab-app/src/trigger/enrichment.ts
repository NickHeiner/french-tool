import { task } from "@trigger.dev/sdk";
import { neon } from "@neondatabase/serverless";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are helping a French learner at CEFR B1 level. They are conversational but rusty — they studied French academically from 7th grade through the first semester of college, forgot a lot of it, and have been taking periodic lessons to get it back. They can hold a conversation with their teacher but rely on some crutches.

Example sentences should use common vocabulary and straightforward grammar, but don't dumb it down to tourist-phrase level. Do include subjunctive, conditional, and simple future tenses — the user is actively working on these. Avoid complex literary tenses (passé simple, plus-que-parfait du subjonctif) and business/technical jargon unless the target word specifically calls for it.`;

export const generateEnrichment = task({
  id: "generate-enrichment",
  run: async (payload: { wordId: string; french: string; english: string }) => {
    const sql = neon(process.env.DATABASE_URL!);
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate enrichment data for the French word/phrase: "${payload.french}" (English: "${payload.english}")

Return a JSON object with exactly these fields:
{
  "example_sentences": ["2-3 example sentences using this word in natural French context, each with an English translation in parentheses"],
  "usage_note": "A brief note about register, common collocations, common mistakes, or gotchas",
  "related_forms": {
    "forms": ["relevant conjugations, gendered variants, or common derivatives with brief explanations"]
  }
}

Return ONLY the JSON, no markdown formatting or code blocks.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    let enrichment;
    try {
      enrichment = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enrichment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse enrichment response: ${text}`);
      }
    }

    await sql`
      INSERT INTO enrichments (word_id, example_sentences, usage_note, related_forms)
      VALUES (
        ${payload.wordId}::uuid,
        ${JSON.stringify(enrichment.example_sentences)}::jsonb,
        ${enrichment.usage_note},
        ${JSON.stringify(enrichment.related_forms)}::jsonb
      )
    `;

    return { success: true, wordId: payload.wordId };
  },
});
