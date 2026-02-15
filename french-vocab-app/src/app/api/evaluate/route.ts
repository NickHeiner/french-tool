import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAnthropicClient, FRENCH_LEARNER_SYSTEM_PROMPT } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { exerciseId, userInput } = await request.json();

    if (!exerciseId || !userInput) {
      return NextResponse.json(
        { error: "exerciseId and userInput are required" },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Get the exercise and its word
    const exercises = await sql`
      SELECT e.*, w.french, w.english
      FROM exercises e
      JOIN words w ON w.id = e.word_id
      WHERE e.id = ${exerciseId}::uuid
    `;

    if (exercises.length === 0) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const exercise = exercises[0];
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      system: FRENCH_LEARNER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Evaluate this French sentence written by the learner.

Target word/phrase: "${exercise.french}" (English: "${exercise.english}")
Exercise prompt: "${exercise.prompt}"
Learner's sentence: "${userInput}"

Provide feedback as a JSON object with these fields:
{
  "correct": true/false (whether the sentence is grammatically correct and uses the word appropriately),
  "feedback": "Direct feedback about correctness, grammar, and natural usage. Be specific about any errors.",
  "corrected_sentence": "The corrected version if there were errors, or null if correct",
  "naturalness": "brief" | "good" | "excellent" (how natural the sentence sounds)
}

Return ONLY the JSON, no markdown.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    let feedback;
    try {
      feedback = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        feedback = { correct: false, feedback: text, naturalness: "brief" };
      }
    }

    // Store the attempt
    await sql`
      INSERT INTO sentence_attempts (exercise_id, user_input, llm_feedback)
      VALUES (${exerciseId}::uuid, ${userInput}, ${JSON.stringify(feedback)}::jsonb)
    `;

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}
