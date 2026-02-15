
import postgres from "postgres";

import { env } from "@/lib/env";

declare global {
  var __frenchVocabSql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__frenchVocabSql ??
  postgres(env.databaseUrl, {
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__frenchVocabSql = sql;
}
