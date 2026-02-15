create extension if not exists pgcrypto;

create table if not exists words (
  id uuid primary key default gen_random_uuid(),
  french text not null,
  english text not null,
  quizlet_set_id text not null,
  created_at timestamptz not null default now(),
  unique (quizlet_set_id, french, english)
);

create table if not exists enrichments (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references words(id) on delete cascade,
  example_sentences jsonb not null,
  usage_note text not null,
  related_forms jsonb not null,
  created_at timestamptz not null default now(),
  unique (word_id)
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references words(id) on delete cascade,
  type text not null check (type in ('fill_blank', 'context_guess', 'sentence_construction')),
  prompt text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists sentence_attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  user_input text not null,
  llm_feedback jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_words_set_id on words(quizlet_set_id);
create index if not exists idx_words_french on words(french);
create index if not exists idx_exercises_word_id on exercises(word_id);
create index if not exists idx_sentence_attempts_exercise_id on sentence_attempts(exercise_id);
