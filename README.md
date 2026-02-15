# French Vocabulary Learning App

Full-stack Next.js app that ingests a single Quizlet set, stores vocabulary in Neon Postgres, generates enrichment/exercises with Claude, and runs background generation with Trigger.dev.

## Stack

- Next.js 16 + TypeScript
- Neon Postgres (`postgres` driver)
- Anthropic Claude (`@anthropic-ai/sdk`)
- Trigger.dev v4 SDK + tasks in `trigger/`
- Password-only auth gate via cookie + proxy middleware

## Features

- Password-gated app (`APP_PASSWORD`, with `WEB_PASSWORD` fallback)
- Hourly cron endpoint `/api/cron/quizlet` (configured in `vercel.json`)
- Quizlet ingestion via undocumented web API versions `3.5/3.4/3.2` with HTML fallback parser
- New words inserted into `words`, then queued for Trigger tasks:
  - `generate-enrichment`
  - `generate-exercises`
- Mobile-first UI:
  - `/` word list + search
  - `/words/[id]` detail + enrichment + grouped exercises
  - `/practice` optional practice mode
- Live sentence evaluation endpoint (`/api/exercises/[exerciseId]/attempt`) with stored feedback

## Environment

Copy `.env.example` to `.env` and set values:

- `APP_PASSWORD` (or `WEB_PASSWORD`)
- `DATABASE_URL` (or `NEON_CONNECTION_STRING_DEV_BRANCH`)
- `ANTHROPIC_API_KEY`
- `QUIZLET_SET_URL`
- `TRIGGER_SECRET_KEY` (or `TRIGGER_SECRET_KEY_DEV`)
- `TRIGGER_PROJECT_ID`
- `CRON_SECRET` (recommended for cron route auth)

## Setup

```bash
npm install
npm run db:migrate
npm run dev
```

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:migrate
npm run trigger:dev
npm run trigger:deploy
```

## Trigger Tasks

Tasks live in `trigger/word-generation.ts`.

- `generate-enrichment` creates/updates one row in `enrichments`.
- `generate-exercises` appends generated exercises in `exercises`.

## Operational Note: Quizlet Blocking

Quizlet currently returns Cloudflare captcha/challenge responses from some server environments. This repo handles that by:

1. trying multiple undocumented API versions,
2. trying HTML `__NEXT_DATA__` extraction,
3. throwing an explicit ingestion error if both are blocked.

If ingestion fails in production, inspect `/api/cron/quizlet` response and consider a manual ingestion fallback while endpoint behavior is fixed.
