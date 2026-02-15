import { getDb } from "@/lib/db";
import type { Word, Enrichment, Exercise } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/exercise-card";
import { GenerateMoreButton } from "@/components/generate-more-button";

export const dynamic = "force-dynamic";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sql = getDb();

  const words = (await sql`
    SELECT * FROM words WHERE id = ${id}::uuid
  `) as Word[];

  if (words.length === 0) {
    notFound();
  }

  const word = words[0];

  const enrichments = (await sql`
    SELECT * FROM enrichments WHERE word_id = ${id}::uuid ORDER BY created_at DESC LIMIT 1
  `) as Enrichment[];

  const exercises = (await sql`
    SELECT * FROM exercises WHERE word_id = ${id}::uuid ORDER BY type, created_at
  `) as Exercise[];

  const rawEnrichment = enrichments[0] || null;
  const enrichment = rawEnrichment
    ? {
        ...rawEnrichment,
        example_sentences: rawEnrichment.example_sentences as string[],
        usage_note: rawEnrichment.usage_note as string | null,
        related_forms: rawEnrichment.related_forms as {
          forms?: string[];
        },
      }
    : null;

  const fillBlank = exercises.filter((e) => e.type === "fill_blank");
  const contextGuess = exercises.filter((e) => e.type === "context_guess");
  const sentenceConstruction = exercises.filter(
    (e) => e.type === "sentence_construction"
  );

  return (
    <div className="py-6">
      <Link
        href="/words"
        className="mb-4 inline-flex items-center text-sm text-blue-600"
      >
        &larr; Back to words
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{word.french}</h1>
        <p className="mt-1 text-lg text-gray-600">{word.english}</p>
      </header>

      {/* Enrichment */}
      {enrichment ? (
        <div className="space-y-4 mb-8">
          {/* Example Sentences */}
          <section className="card">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Example Sentences
            </h2>
            <ul className="space-y-2">
              {enrichment.example_sentences.map((sentence, i) => (
                <li key={i} className="text-gray-800 leading-relaxed">
                  {sentence}
                </li>
              ))}
            </ul>
          </section>

          {/* Usage Note */}
          {enrichment.usage_note && (
            <section className="card">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Usage Note
              </h2>
              <p className="text-gray-800 leading-relaxed">
                {enrichment.usage_note}
              </p>
            </section>
          )}

          {/* Related Forms */}
          {enrichment.related_forms?.forms &&
            enrichment.related_forms.forms.length > 0 && (
              <section className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Related Forms
                </h2>
                <ul className="space-y-1">
                  {enrichment.related_forms.forms.map((form, i) => (
                    <li key={i} className="text-gray-800">
                      {form}
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>
      ) : (
        <div className="card mb-8 text-center text-gray-500 py-8">
          <p>Enrichment data is being generated...</p>
          <p className="mt-1 text-sm">Refresh in a moment.</p>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-6">
        {fillBlank.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Fill in the Blank
            </h2>
            <div className="space-y-2">
              {fillBlank.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </section>
        )}

        {contextGuess.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Context Guessing
            </h2>
            <div className="space-y-2">
              {contextGuess.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </section>
        )}

        {sentenceConstruction.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sentence Construction
            </h2>
            <div className="space-y-2">
              {sentenceConstruction.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </section>
        )}

        {exercises.length === 0 && (
          <div className="card text-center text-gray-500 py-8">
            <p>Exercises are being generated...</p>
            <p className="mt-1 text-sm">Refresh in a moment.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <GenerateMoreButton wordId={word.id} />
      </div>
    </div>
  );
}
