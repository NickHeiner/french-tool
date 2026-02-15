import { PracticeDeck } from "@/components/practice-deck";
import { getPracticeExercises } from "@/lib/words";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const exercises = await getPracticeExercises(40);

  return (
    <main>
      <h1 className="section-title">Practice Mode</h1>
      <PracticeDeck exercises={exercises} />
    </main>
  );
}
