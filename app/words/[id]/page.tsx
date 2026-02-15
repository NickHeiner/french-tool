import { notFound } from "next/navigation";

import { ExerciseGroups } from "@/components/exercise-groups";
import { GenerateMoreButton } from "@/components/generate-more-button";
import { getWordDetail } from "@/lib/words";

export const dynamic = "force-dynamic";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getWordDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <main>
      <section className="card">
        <h1 className="card-title">{detail.word.french}</h1>
        <p>{detail.word.english}</p>
        <p className="meta">Imported from set {detail.word.quizletSetId}</p>
      </section>

      <section className="card" style={{ marginTop: "0.9rem" }}>
        <h2 className="section-title">Enrichment</h2>
        {detail.enrichment ? (
          <div className="split">
            <div>
              <h3 className="card-title">Example Sentences</h3>
              {detail.enrichment.exampleSentences.map((sentence, index) => (
                <p key={`${detail.enrichment?.id}-sentence-${index}`}>{sentence}</p>
              ))}
            </div>
            <div>
              <h3 className="card-title">Usage Note</h3>
              <p>{detail.enrichment.usageNote}</p>
              <h3 className="card-title">Related Forms</h3>
              {detail.enrichment.relatedForms.map((form, index) => (
                <p key={`${detail.enrichment?.id}-form-${index}`}>{form}</p>
              ))}
            </div>
          </div>
        ) : (
          <p className="meta">No enrichment yet. It will appear after background generation runs.</p>
        )}

        <GenerateMoreButton wordId={detail.word.id} />
      </section>

      <section style={{ marginTop: "0.9rem" }}>
        {detail.exercises.length > 0 ? (
          <ExerciseGroups exercises={detail.exercises} />
        ) : (
          <div className="card">No exercises yet. Generate more to queue new ones.</div>
        )}
      </section>
    </main>
  );
}
