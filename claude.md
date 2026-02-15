For substantial undertakings, keep a record of your key decisions & challenges in @agent-workspace/work-logs/*.md.

You are one of several agents operating simultaneously. You have your own git worktree. Service isolation:
* Trigger offers branches. Your branch name is set in your env var.
* Neon offers branches. Your connection string is in the `NEON_CONNECTION_STRING_DEV_BRANCH` env var.
* Vercel is just a single deployment, so don't deploy to prod unless you've been authorized to do so.

When you learn something that would be helpful for the next agent to come along (e.g. some surprising thing you need to do get a command to run in this env, etc), document it in this file. And generally keepe this file up to date with architectural notes etc, so future agents start with all the helpful context they need to be productive.

Commit your work in logical chunks as you go.


## Notes from 2026-02-15

- The app is now a full Next.js 16 codebase in this worktree (`app/`, `lib/`, `trigger/`, `db/`).
- Runtime auth guard uses `proxy.ts` (Next 16 replacement for `middleware.ts`).
- DB schema/migrations live in `db/migrations/` and are applied via `npm run db:migrate`.
- `scripts/migrate.ts` depends on dotenv loading (`import "dotenv/config"`) to read `.env` outside Next runtime.
- Trigger tasks are in `trigger/word-generation.ts` with IDs:
  - `generate-enrichment`
  - `generate-exercises`
- Cron ingestion endpoint is `GET/POST /api/cron/quizlet` and is scheduled hourly via `vercel.json`.
- Quizlet ingestion is currently prone to Cloudflare challenge/captcha responses from this environment. The code now logs explicit failures after trying:
  1. undocumented web APIs (`/webapi/3.5`, `/3.4`, `/3.2`)
  2. HTML `__NEXT_DATA__` extraction fallback
- If ingestion starts failing in deployed env, first check raw response body/status from `/api/cron/quizlet`; this is the most likely break point.
