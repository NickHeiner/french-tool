import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk";
import type { generateExercises } from "@/trigger/exercises";

export async function POST(request: NextRequest) {
  try {
    const { wordId } = await request.json();

    if (!wordId) {
      return NextResponse.json(
        { error: "wordId is required" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const words = await sql`
      SELECT id, french, english FROM words WHERE id = ${wordId}::uuid
    `;

    if (words.length === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const word = words[0];

    await tasks.trigger<typeof generateExercises>("generate-exercises", {
      wordId: word.id as string,
      french: word.french as string,
      english: word.english as string,
    });

    return NextResponse.json({ success: true, message: "Generation triggered" });
  } catch (error) {
    console.error("Generate more error:", error);
    return NextResponse.json(
      { error: "Failed to trigger generation" },
      { status: 500 }
    );
  }
}
