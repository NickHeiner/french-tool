import Link from "next/link";

import { listWords } from "@/lib/words";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const words = await listWords(query);

  return (
    <main>
      <section className="card">
        <h1 className="card-title">Word List</h1>
        <p className="meta">Browse imported Quizlet words and open each for details and exercises.</p>
        <form method="get" className="exercise-actions" style={{ marginTop: "0.5rem" }}>
          <input type="search" name="q" defaultValue={query} placeholder="Search French or English" />
          <button type="submit">Search</button>
        </form>
      </section>

      <section style={{ marginTop: "1rem" }}>
        {words.length === 0 ? (
          <div className="card">No words found.</div>
        ) : (
          <div className="grid">
            {words.map((word) => (
              <Link key={word.id} href={`/words/${word.id}`} className="card">
                <h2 className="card-title">{word.french}</h2>
                <p>{word.english}</p>
                <p className="meta">{word.exerciseCount} exercises</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
