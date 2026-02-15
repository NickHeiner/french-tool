import { NextResponse } from "next/server";
import { z } from "zod";

import { triggerTasks } from "@/lib/trigger-client";
import { getWordById } from "@/lib/words";

const payloadSchema = z.object({
  perType: z.number().int().min(1).max(6).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordId: string }> },
) {
  const { wordId } = await params;
  const word = await getWordById(wordId);

  if (!word) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const trigger = triggerTasks();
  const run = await trigger.trigger("generate-exercises", {
    wordId,
    perType: parsed.data.perType ?? 3,
  });

  return NextResponse.json({ ok: true, runId: run.id });
}
