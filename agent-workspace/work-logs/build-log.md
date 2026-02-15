# French Vocab App Build Log

## Key Decisions
- Using Next.js 16 App Router with TypeScript
- Neon Postgres via `@neondatabase/serverless` driver (neon tagged template literals)
- Trigger.dev v3 for background jobs (enrichment + exercise generation)
- Simple cookie-based auth with middleware (password from APP_PASSWORD env var)
- Tailwind CSS v4 for styling (mobile-first)
- Anthropic Claude API for LLM calls (enrichment, exercises, sentence evaluation)

## Challenges
- **Quizlet scraping blocked by Cloudflare**: Server-side fetch to quizlet.com returns 403.
  The workaround is a POST /api/ingest endpoint that accepts a JSON array of terms.
  The browser can scrape `.TermText` elements from the Quizlet page. The GET /api/ingest
  still attempts the scrape but falls back to instructions for manual import.
- **Neon branch isolation**: The production branch has the schema but the dev branch
  (dev-primary / br-tiny-flower-ak5x93gl) needed tables created separately.
- **Next.js 16 middleware deprecation**: The `middleware.ts` convention is deprecated in
  favor of `proxy`. It still works but shows a warning.

## Architecture
- `french-vocab-app/src/app/` - Next.js app router pages
- `french-vocab-app/src/lib/` - shared utilities (db, auth, llm, quizlet)
- `french-vocab-app/src/trigger/` - trigger.dev task definitions
- `french-vocab-app/src/components/` - React components
- `french-vocab-app/trigger.config.ts` - Trigger.dev configuration

## Verified Working
- Login page with password auth
- Word list (71 words from Quizlet import)
- Word detail with enrichment, exercises (all 3 types)
- Live sentence construction evaluation via Claude API
- Search/filter on word list
- Practice mode (random exercise selection)
