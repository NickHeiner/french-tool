# 2026-02-15 - French vocab app implementation log

## Scope

Implemented the full app from `agent-workspace/french-vocab-app-spec.md` in this worktree.

## Key decisions

1. **Next.js 16 with App Router**
- Chose direct app-router implementation with dynamic server-rendered pages for DB-backed views.
- Added `proxy.ts` (instead of deprecated `middleware.ts` in Next 16) for password cookie gate.

2. **DB access pattern**
- Used plain `postgres` client over ORM to keep schema/query logic straightforward.
- Added migration script (`scripts/migrate.ts`) + SQL migration (`db/migrations/001_init.sql`) with `schema_migrations` bookkeeping.

3. **Auth model**
- Implemented single shared-password gate via `/api/auth/login` + HTTP-only cookie.
- Middleware/proxy protects all routes except login + cron + auth login endpoint.

4. **Trigger orchestration**
- Implemented two tasks per spec in `trigger/word-generation.ts`:
  - `generate-enrichment`
  - `generate-exercises`
- Cron ingestion endpoint enqueues both tasks for each newly inserted word.

5. **Quizlet ingestion strategy**
- Added undocumented endpoint attempts for versions `3.5`, `3.4`, `3.2`.
- Added fallback HTML `__NEXT_DATA__` parser.
- Added explicit error surfaces when Cloudflare/captcha blocks ingestion.

## Challenges

1. **Cloudflare challenge on Quizlet**
- Direct HTTP requests returned 403 challenge/captcha from this environment.
- Built multi-strategy parser + explicit failure message so operations know exactly what failed.

2. **Next 16 build-time prerendering hitting DB**
- Build failed when static generation queried missing tables.
- Marked DB-backed pages as `dynamic = "force-dynamic"`.

3. **Script runtime vs Next-only imports**
- `server-only` import caused migration script runtime errors.
- Removed `server-only` imports from shared modules and loaded dotenv in migration script.

## Validation run

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run db:migrate` passed (applied `001_init.sql`)
- `npm run build` passed
- `npx tsx -e "...fetchQuizletCards..."` confirmed current Quizlet blocking behavior in this environment
