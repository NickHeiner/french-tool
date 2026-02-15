For substantial undertakings, keep a record of your key decisions & challenges in @agent-workspace/work-logs/*.md.

You are one of several agents operating simultaneously. You have your own git worktree. Service isolation:
* Trigger offers branches. Your branch name is set in your env var.
* Neon offers branches. Your connection string is in the `NEON_CONNECTION_STRING_DEV_BRANCH` env var.
* Vercel is just a single deployment, so don't deploy to prod unless you've been authorized to do so.

When you learn something that would be helpful for the next agent to come along (e.g. some surprising thing you need to do get a command to run in this env, etc), document it in this file. And generally keepe this file up to date with architectural notes etc, so future agents start with all the helpful context they need to be productive.

Commit your work in logical chunks as you go.

## Architecture Notes (French Vocab App)

The app lives in `french-vocab-app/`. It's a Next.js 16 app with TypeScript, Tailwind CSS v4, Neon Postgres, Trigger.dev, and the Anthropic API.

### Key things to know
- **Quizlet scraping is blocked by Cloudflare**. You cannot fetch quizlet.com server-side. Use the POST /api/ingest endpoint with a JSON body of `{terms: [{french, english}], setId}`. You can get the terms by loading the Quizlet page in a browser and extracting `.TermText` elements.
- **Neon dev branch** is `dev-primary` (br-tiny-flower-ak5x93gl). The schema must be created separately on each branch.
- **Trigger.dev preview branch** is `primary`. Tasks are in `src/trigger/`.
- **Next.js 16 deprecated `middleware.ts`** in favor of `proxy`. The middleware still works but shows a warning at build time.
- **The `.env.local` file** is gitignored. Env vars: DATABASE_URL, APP_PASSWORD, ANTHROPIC_API_KEY, TRIGGER_SECRET_KEY, QUIZLET_SET_URL, QUIZLET_SET_ID.
- Run `npx next dev --port 3456` from the `french-vocab-app/` directory.
