import { getDb } from "@/lib/db";
import type { Word } from "@/lib/db";
import Link from "next/link";
import { WordSearch } from "@/components/word-search";

export const dynamic = "force-dynamic";

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const sql = getDb();

  let words: Word[];
  if (q) {
    words = (await sql`
      SELECT * FROM words
      WHERE french ILIKE ${"%" + q + "%"} OR english ILIKE ${"%" + q + "%"}
      ORDER BY created_at DESC
    `) as Word[];
  } else {
    words = (await sql`
      SELECT * FROM words ORDER BY created_at DESC
    `) as Word[];
  }

  return (
    <div className="py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">French Vocab</h1>
        <p className="mt-1 text-sm text-gray-500">{words.length} words</p>
      </header>

      <WordSearch initialQuery={q || ""} />

      <div className="mt-4 space-y-2">
        {words.length === 0 ? (
          <div className="card text-center text-gray-500 py-12">
            <p className="text-lg">No words yet</p>
            <p className="mt-2 text-sm">
              Words will appear here after the Quizlet import runs.
            </p>
          </div>
        ) : (
          words.map((word) => (
            <Link
              key={word.id}
              href={`/words/${word.id}`}
              className="card block active:bg-gray-50 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-lg font-medium text-gray-900">
                  {word.french}
                </span>
                <span className="text-sm text-gray-500 text-right shrink-0">
                  {word.english}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/practice" className="btn-secondary flex-1 text-center">
          Practice
        </Link>
      </div>
    </div>
  );
}
