
import type {
  Exercise,
  GeneratedEnrichment,
  GeneratedExercise,
  SentenceFeedback,
  WordDetail,
  WordSummary,
} from "@/lib/types";
import { sql } from "@/lib/db";

type DbWord = {
  id: string;
  french: string;
  english: string;
  quizlet_set_id: string;
  created_at: string;
};

type DbEnrichment = {
  id: string;
  word_id: string;
  example_sentences: string[];
  usage_note: string;
  related_forms: string[];
  created_at: string;
};

type DbExercise = {
  id: string;
  word_id: string;
  type: Exercise["type"];
  prompt: string;
  answer: string;
  created_at: string;
};

function mapWord(row: DbWord) {
  return {
    id: row.id,
    french: row.french,
    english: row.english,
    quizletSetId: row.quizlet_set_id,
    createdAt: row.created_at,
  };
}

function mapExercise(row: DbExercise): Exercise {
  return {
    id: row.id,
    wordId: row.word_id,
    type: row.type,
    prompt: row.prompt,
    answer: row.answer,
    createdAt: row.created_at,
  };
}

export async function listWords(searchTerm = ""): Promise<WordSummary[]> {
  const normalizedSearch = searchTerm.trim();
  const whereClause = normalizedSearch
    ? sql`where (w.french ilike ${`%${normalizedSearch}%`} or w.english ilike ${`%${normalizedSearch}%`})`
    : sql``;

  const rows = await sql<Array<DbWord & { exercise_count: number }>>`
    select
      w.id,
      w.french,
      w.english,
      w.quizlet_set_id,
      w.created_at,
      (select count(*)::int from exercises e where e.word_id = w.id) as exercise_count
    from words w
    ${whereClause}
    order by w.french asc
  `;

  return rows.map((row) => ({
    ...mapWord(row),
    exerciseCount: Number(row.exercise_count ?? 0),
  }));
}

export async function getWordById(
  wordId: string,
): Promise<{ id: string; french: string; english: string; quizletSetId: string } | null> {
  const [row] = await sql<DbWord[]>`
    select id, french, english, quizlet_set_id, created_at
    from words
    where id = ${wordId}
    limit 1
  `;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    french: row.french,
    english: row.english,
    quizletSetId: row.quizlet_set_id,
  };
}

export async function getWordDetail(wordId: string): Promise<WordDetail | null> {
  const [word] = await sql<DbWord[]>`
    select id, french, english, quizlet_set_id, created_at
    from words
    where id = ${wordId}
  `;

  if (!word) {
    return null;
  }

  const [enrichment] = await sql<DbEnrichment[]>`
    select id, word_id, example_sentences, usage_note, related_forms, created_at
    from enrichments
    where word_id = ${wordId}
    order by created_at desc
    limit 1
  `;

  const exercises = await sql<DbExercise[]>`
    select id, word_id, type, prompt, answer, created_at
    from exercises
    where word_id = ${wordId}
    order by created_at desc
  `;

  return {
    word: mapWord(word),
    enrichment: enrichment
      ? {
          id: enrichment.id,
          wordId: enrichment.word_id,
          exampleSentences: enrichment.example_sentences,
          usageNote: enrichment.usage_note,
          relatedForms: enrichment.related_forms,
          createdAt: enrichment.created_at,
        }
      : null,
    exercises: exercises.map(mapExercise),
  };
}

export async function getPracticeExercises(
  limit = 30,
): Promise<Array<Exercise & { french: string; english: string }>> {
  const rows = await sql<Array<DbExercise & { french: string; english: string }>>`
    select
      e.id,
      e.word_id,
      e.type,
      e.prompt,
      e.answer,
      e.created_at,
      w.french,
      w.english
    from exercises e
    join words w on w.id = e.word_id
    order by e.created_at desc
    limit ${limit}
  `;

  return rows.map((row) => ({
    ...mapExercise(row),
    french: row.french,
    english: row.english,
  }));
}

export async function getExerciseWithWord(exerciseId: string): Promise<
  | {
      exercise: Exercise;
      word: { id: string; french: string; english: string };
    }
  | null
> {
  const [row] = await sql<Array<DbExercise & { french: string; english: string }>>`
    select
      e.id,
      e.word_id,
      e.type,
      e.prompt,
      e.answer,
      e.created_at,
      w.french,
      w.english
    from exercises e
    join words w on w.id = e.word_id
    where e.id = ${exerciseId}
    limit 1
  `;

  if (!row) {
    return null;
  }

  return {
    exercise: mapExercise(row),
    word: {
      id: row.word_id,
      french: row.french,
      english: row.english,
    },
  };
}

export async function listWordsForSet(quizletSetId: string): Promise<Array<{ french: string; english: string }>> {
  const rows = await sql<Array<{ french: string; english: string }>>`
    select french, english
    from words
    where quizlet_set_id = ${quizletSetId}
  `;

  return rows;
}

export async function insertWords(
  quizletSetId: string,
  rows: Array<{ french: string; english: string }>,
): Promise<Array<{ id: string; french: string; english: string }>> {
  if (rows.length === 0) {
    return [];
  }

  const inserted: Array<{ id: string; french: string; english: string }> = [];

  for (const row of rows) {
    const [result] = await sql<Array<{ id: string; french: string; english: string }>>`
      insert into words (french, english, quizlet_set_id)
      values (${row.french}, ${row.english}, ${quizletSetId})
      on conflict (quizlet_set_id, french, english) do nothing
      returning id, french, english
    `;

    if (result) {
      inserted.push(result);
    }
  }

  return inserted;
}

export async function upsertEnrichment(wordId: string, enrichment: GeneratedEnrichment): Promise<void> {
  await sql`
    insert into enrichments (word_id, example_sentences, usage_note, related_forms)
    values (
      ${wordId},
      ${sql.json(enrichment.exampleSentences)},
      ${enrichment.usageNote},
      ${sql.json(enrichment.relatedForms)}
    )
    on conflict (word_id)
    do update
      set example_sentences = excluded.example_sentences,
          usage_note = excluded.usage_note,
          related_forms = excluded.related_forms,
          created_at = now()
  `;
}

export async function insertExercises(wordId: string, exercises: GeneratedExercise[]): Promise<void> {
  if (exercises.length === 0) {
    return;
  }

  const values = exercises.map((exercise) => ({
    word_id: wordId,
    type: exercise.type,
    prompt: exercise.prompt,
    answer: exercise.answer,
  }));

  await sql`
    insert into exercises ${sql(values, "word_id", "type", "prompt", "answer")}
  `;
}

export async function insertSentenceAttempt(args: {
  exerciseId: string;
  userInput: string;
  llmFeedback: SentenceFeedback;
}): Promise<void> {
  await sql`
    insert into sentence_attempts (exercise_id, user_input, llm_feedback)
    values (${args.exerciseId}, ${args.userInput}, ${sql.json(args.llmFeedback)})
  `;
}
