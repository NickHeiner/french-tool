# French Vocabulary Learning App — Full Spec & Implementation Prompt

## Overview

Build a full-stack TypeScript Next.js app that imports flashcard sets from Quizlet and enhances them with LLM-generated contextual enrichment and interactive exercises. The app is for a single user learning French.

---

## Tech Stack

- **Framework**: Next.js (TypeScript), deployed to Vercel
- **Database**: Neon (Postgres)
- **Auth**: Simple password gate — a single hardcoded password stored in an env var (`APP_PASSWORD`). On first visit, user enters the password; store it in a cookie/session. Middleware checks the cookie on every request. No user accounts, no auth library.
- **LLM**: Anthropic API (Claude)
- **Background Jobs**: trigger.dev — handles all async LLM generation work (enrichment, exercises). Provides retries, timeout handling, and observability.

---

## Data Model

### `words`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| french | text | The French term |
| english | text | The English translation |
| quizlet_set_id | text | Identifier for the source set |
| created_at | timestamptz | When this word was ingested |

### `enrichments`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| word_id | uuid | FK → words |
| example_sentences | jsonb | Array of 2-3 example sentences |
| usage_note | text | Register, collocations, gotchas |
| related_forms | jsonb | Conjugation highlights, gendered variants, derivatives |
| created_at | timestamptz | |

### `exercises`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| word_id | uuid | FK → words |
| type | text | One of: `fill_blank`, `context_guess`, `sentence_construction` |
| prompt | text | The exercise prompt shown to the user |
| answer | text | The correct/model answer |
| created_at | timestamptz | |

### `sentence_attempts`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| exercise_id | uuid | FK → exercises |
| user_input | text | What the user typed |
| llm_feedback | jsonb | Claude's evaluation of the attempt |
| created_at | timestamptz | |

---

## Quizlet Ingestion

- The app is configured with a single Quizlet set URL (stored as an env var or in the database).
- A Vercel cron job runs **every hour**.
- The cron job fetches the current card set from Quizlet using an **unofficial/undocumented API endpoint**. This is a known risk; if it breaks, we fix it.
- The cron job diffs the fetched cards against existing rows in `words`. Any new cards are inserted.
- For each newly inserted word, the cron job triggers a **trigger.dev job** to generate enrichment and exercises.

---

## LLM Generation (trigger.dev jobs)

When a new word is ingested, trigger.dev runs two tasks (can be parallel):

### Task 1: Enrichment Generation
Call Claude to generate:
- 2-3 example sentences showing the word in natural context
- A usage note (register, common collocations, gotchas)
- Related forms (conjugation highlights, gendered variants, common derivatives)

Store the result in the `enrichments` table.

### Task 2: Exercise Generation
Call Claude to generate a batch of exercises for the word:
- **Fill-in-the-blank**: A sentence with the target word removed. The answer is the missing word.
- **Context guessing**: A French sentence using the word. The user guesses the meaning before revealing the English translation and explanation.
- **Sentence construction**: A prompt like "Use [word] in a sentence about [topic]." No pre-generated answer — this exercise type is evaluated live (see below).

Generate ~3 of each type per word. Store in the `exercises` table.

### "Generate More" (user-initiated)
The user can request more exercises for any word. This triggers an on-demand trigger.dev job (or a direct API route call to Claude) that generates additional exercises and appends them to the `exercises` table.

---

## Sentence Construction Evaluation (live LLM call)

For `sentence_construction` exercises, the flow is:
1. User sees a prompt: "Use [word] in a sentence about [topic]."
2. User types a French sentence and submits.
3. The app makes a **single synchronous Claude API call** with the prompt, the target word, and the user's sentence.
4. Claude returns feedback: correctness, naturalness, grammar notes.
5. The feedback is displayed to the user and stored in `sentence_attempts`.

This is **not** a chat. One submission, one evaluation. The user can submit again if they want, but each attempt is independent — no conversation threading.

---

## LLM Proficiency Prompt

Include the following system-level context in all LLM calls related to enrichment, exercise generation, and sentence evaluation:

> You are helping a French learner at CEFR B1 level. They are conversational but rusty — they studied French academically from 7th grade through the first semester of college, forgot a lot of it, and have been taking periodic lessons to get it back. They can hold a conversation with their teacher but rely on some crutches.
>
> Example sentences should use common vocabulary and straightforward grammar, but don't dumb it down to tourist-phrase level. Do include subjunctive, conditional, and simple future tenses — the user is actively working on these. Avoid complex literary tenses (passé simple, plus-que-parfait du subjonctif) and business/technical jargon unless the target word specifically calls for it.
>
> When evaluating user-written sentences, be direct about errors. Don't be encouraging for the sake of it — just tell them what's wrong and how to fix it. If the sentence is correct, say so briefly and move on.

---

## UI / UX Requirements

### Hard requirement: mobile-first responsive design
The app must work well on phone and iPad. This is the primary usage context. Design for touch: large tap targets, card-based layouts, minimal navigation.

### Pages / Views

**Word List**
- Browse all imported words. Each word shows French → English.
- Search and filter.
- Tap a word to see its detail view.

**Word Detail**
- The word and translation
- Enrichment: example sentences, usage note, related forms
- Exercises grouped by type
- "Generate more exercises" button

**Exercise View**
- **Fill-in-the-blank**: Show the sentence with a blank. User types the answer. Tap to reveal correct answer.
- **Context guessing**: Show the French sentence. User thinks about the meaning. Tap to reveal the English meaning and explanation.
- **Sentence construction**: Show the prompt. User types a French sentence. Submit button triggers live evaluation. Feedback displayed below. User can submit another attempt independently.

**Practice Mode** (optional nice-to-have)
- Cycle through exercises across all words (or a filtered set). Card-swipe or next/prev navigation.

### Design
Keep it clean and simple. No flashy UI. Think "Notion-level simplicity" — readable typography, good whitespace, clear hierarchy. Dark mode is not required but is a nice-to-have.

---

## Non-Goals for v1

- User accounts / multi-user support
- Spaced repetition / progress tracking
- Conversation mode / multi-turn chat
- Proficiency auto-detection
- Multiple Quizlet set support (just one URL)
- Dark mode (nice-to-have, not required)

---

The quizlet URL is https://quizlet.com/1131039212/french-vocab-nick-flash-cards/?i=706z49&x=1jqU. You'll need to figure out how to use the undocumented API to get the data.

------

**You have one shot to complete this entire task. Do not ask the user follow-up questions or present an unimplemented plan. Just do it!**

Spend as long as you need on this to produce amazing results. You do not have a token or time limit.
