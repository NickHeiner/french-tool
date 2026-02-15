import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluateSentence } from "@/lib/llm";
import { getExerciseWithWord, insertSentenceAttempt } from "@/lib/words";

const payloadSchema = z.object({
  userInput: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  const { exerciseId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Sentence input is required" }, { status: 400 });
  }

  const record = await getExerciseWithWord(exerciseId);
  if (!record) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (record.exercise.type !== "sentence_construction") {
    return NextResponse.json(
      { error: "Only sentence construction exercises accept attempts" },
      { status: 400 },
    );
  }

  const feedback = await evaluateSentence({
    french: record.word.french,
    english: record.word.english,
    exercisePrompt: record.exercise.prompt,
    userSentence: parsed.data.userInput,
  });

  await insertSentenceAttempt({
    exerciseId,
    userInput: parsed.data.userInput,
    llmFeedback: feedback,
  });

  return NextResponse.json({ ok: true, feedback });
}
