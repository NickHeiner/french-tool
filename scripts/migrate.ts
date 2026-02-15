import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { sql } from "../lib/db";

async function ensureMigrationsTable() {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;
}

async function appliedMigrationNames(): Promise<Set<string>> {
  const rows = await sql<Array<{ name: string }>>`select name from schema_migrations`;
  return new Set(rows.map((row) => row.name));
}

async function run() {
  const migrationDir = path.join(process.cwd(), "db", "migrations");
  const allFiles = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();

  await ensureMigrationsTable();
  const alreadyApplied = await appliedMigrationNames();

  for (const fileName of allFiles) {
    if (alreadyApplied.has(fileName)) {
      continue;
    }

    const filePath = path.join(migrationDir, fileName);
    const sqlText = await readFile(filePath, "utf8");

    await sql.unsafe(sqlText);
    await sql`insert into schema_migrations (name) values (${fileName})`;

    console.log(`Applied migration: ${fileName}`);
  }
}

run()
  .then(async () => {
    await sql.end();
  })
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
