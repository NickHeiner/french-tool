import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { ingestQuizletWords } from "@/lib/ingestion";
import { triggerTasks } from "@/lib/trigger-client";

function isAuthorized(request: Request): boolean {
  if (!env.cronSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${env.cronSecret}`;
}

async function runIngestion(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingestion = await ingestQuizletWords();

  if (ingestion.insertedWords.length > 0) {
    const trigger = triggerTasks();

    await Promise.all(
      ingestion.insertedWords.flatMap((word) => [
        trigger.trigger("generate-enrichment", { wordId: word.id }),
        trigger.trigger("generate-exercises", { wordId: word.id, perType: 3 }),
      ]),
    );
  }

  return NextResponse.json({
    ok: true,
    setId: ingestion.setId,
    fetchedCount: ingestion.fetchedCount,
    insertedCount: ingestion.insertedCount,
  });
}

export async function GET(request: Request) {
  try {
    return await runIngestion(request);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
