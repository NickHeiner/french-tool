import { getDb } from "@/lib/db";
import type { Exercise } from "@/lib/db";
import Link from "next/link";
import { PracticeView } from "@/components/practice-view";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const sql = getDb();

  const exercises = (await sql`
    SELECT e.*, w.french, w.english
    FROM exercises e
    JOIN words w ON w.id = e.word_id
    ORDER BY RANDOM()
    LIMIT 20
  `) as (Exercise & { french: string; english: string })[];

  if (exercises.length === 0) {
    return (
      <div className="py-6">
        <Link
          href="/words"
          className="mb-4 inline-flex items-center text-sm text-blue-600"
        >
          &larr; Back to words
        </Link>
        <div className="card text-center text-gray-500 py-12">
          <p className="text-lg">No exercises available</p>
          <p className="mt-2 text-sm">
            Import some words first, then exercises will be generated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/words"
          className="inline-flex items-center text-sm text-blue-600"
        >
          &larr; Back
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Practice</h1>
        <span className="text-sm text-gray-500">{exercises.length} cards</span>
      </div>

      <PracticeView exercises={exercises} />
    </div>
  );
}
