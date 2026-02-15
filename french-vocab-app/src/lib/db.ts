import { neon } from "@neondatabase/serverless";

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export type Word = {
  id: string;
  french: string;
  english: string;
  quizlet_set_id: string | null;
  created_at: string;
};

export type Enrichment = {
  id: string;
  word_id: string;
  example_sentences: string[];
  usage_note: string | null;
  related_forms: Record<string, unknown>;
  created_at: string;
};

export type Exercise = {
  id: string;
  word_id: string;
  type: "fill_blank" | "context_guess" | "sentence_construction";
  prompt: string;
  answer: string | null;
  created_at: string;
};

export type SentenceAttempt = {
  id: string;
  exercise_id: string;
  user_input: string;
  llm_feedback: Record<string, unknown> | null;
  created_at: string;
};
