import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk";
import type { generateEnrichment } from "@/trigger/enrichment";
import type { generateExercises } from "@/trigger/exercises";

// POST: Manual import of terms (JSON body with terms array)
export async function POST(request: NextRequest) {
  try {
    const { terms, setId } = await request.json();

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json(
        {
          error:
            "Request body must include 'terms' array with {french, english} objects",
        },
        { status: 400 }
      );
    }

    const quizletSetId = setId || process.env.QUIZLET_SET_ID || "manual";
    const sql = getDb();

    // Get existing words for this set
    const existingWords = await sql`
      SELECT french FROM words WHERE quizlet_set_id = ${quizletSetId}
    `;
    const existingFrench = new Set(
      existingWords.map((w) => w.french as string)
    );

    // Find new terms
    const newTerms = terms.filter(
      (t: { french: string }) => !existingFrench.has(t.french)
    );

    if (newTerms.length === 0) {
      return NextResponse.json({
        message: "No new terms found",
        totalTerms: terms.length,
        existingTerms: existingWords.length,
      });
    }

    // Insert new words and trigger enrichment/exercise generation
    const insertedWords = [];
    for (const term of newTerms) {
      const result = await sql`
        INSERT INTO words (french, english, quizlet_set_id)
        VALUES (${term.french}, ${term.english}, ${quizletSetId})
        ON CONFLICT (french, quizlet_set_id) DO NOTHING
        RETURNING id, french, english
      `;
      if (result.length > 0) {
        insertedWords.push(result[0]);
      }
    }

    // Trigger background jobs for each new word
    for (const word of insertedWords) {
      const payload = {
        wordId: word.id as string,
        french: word.french as string,
        english: word.english as string,
      };

      try {
        await tasks.trigger<typeof generateEnrichment>(
          "generate-enrichment",
          payload
        );
        await tasks.trigger<typeof generateExercises>(
          "generate-exercises",
          payload
        );
      } catch (triggerError) {
        console.error(
          "Failed to trigger background jobs (they may not be running):",
          triggerError
        );
        // Continue even if trigger fails - words are still inserted
      }
    }

    return NextResponse.json({
      message: `Ingested ${insertedWords.length} new terms`,
      newTerms: insertedWords.length,
      totalTerms: terms.length,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET: Attempt to scrape Quizlet (may fail due to Cloudflare)
// Falls back to returning instructions for manual import
export async function GET() {
  try {
    const setUrl = process.env.QUIZLET_SET_URL;
    const setId = process.env.QUIZLET_SET_ID;

    if (!setUrl || !setId) {
      return NextResponse.json(
        { error: "QUIZLET_SET_URL and QUIZLET_SET_ID must be set" },
        { status: 500 }
      );
    }

    // Try to fetch from Quizlet (may be blocked by Cloudflare)
    const { fetchQuizletTerms } = await import("@/lib/quizlet");

    try {
      const terms = await fetchQuizletTerms(setUrl);
      const sql = getDb();

      const existingWords = await sql`
        SELECT french FROM words WHERE quizlet_set_id = ${setId}
      `;
      const existingFrench = new Set(
        existingWords.map((w) => w.french as string)
      );

      const newTerms = terms.filter((t) => !existingFrench.has(t.french));

      if (newTerms.length === 0) {
        return NextResponse.json({
          message: "No new terms found",
          totalTerms: terms.length,
          existingTerms: existingWords.length,
        });
      }

      const insertedWords = [];
      for (const term of newTerms) {
        const result = await sql`
          INSERT INTO words (french, english, quizlet_set_id)
          VALUES (${term.french}, ${term.english}, ${setId})
          ON CONFLICT (french, quizlet_set_id) DO NOTHING
          RETURNING id, french, english
        `;
        if (result.length > 0) {
          insertedWords.push(result[0]);
        }
      }

      for (const word of insertedWords) {
        const payload = {
          wordId: word.id as string,
          french: word.french as string,
          english: word.english as string,
        };
        try {
          await tasks.trigger<typeof generateEnrichment>(
            "generate-enrichment",
            payload
          );
          await tasks.trigger<typeof generateExercises>(
            "generate-exercises",
            payload
          );
        } catch {
          // Continue even if trigger fails
        }
      }

      return NextResponse.json({
        message: `Ingested ${insertedWords.length} new terms`,
        newTerms: insertedWords.length,
        totalTerms: terms.length,
      });
    } catch (scrapeError) {
      // Quizlet blocked us - return instructions
      return NextResponse.json({
        message:
          "Quizlet scraping blocked by Cloudflare. Use POST /api/ingest with JSON body instead.",
        instructions:
          "POST with body: { terms: [{french: '...', english: '...'}, ...], setId: '1131039212' }",
        error:
          scrapeError instanceof Error
            ? scrapeError.message
            : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
