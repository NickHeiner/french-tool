
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { env } from "@/lib/env";
import { parseJsonObject } from "@/lib/json";
import { enrichmentPrompt, exercisePrompt, sentenceEvaluationPrompt } from "@/lib/llm-prompt";
import type { GeneratedEnrichment, GeneratedExercise, SentenceFeedback } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

function extractTextFromClaudeResponse(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

const enrichmentSchema = z.object({
  exampleSentences: z.array(z.string()).min(2).max(3),
  usageNote: z.string().min(1),
  relatedForms: z.array(z.string()).min(1),
});

const exerciseSchema = z.object({
  exercises: z
    .array(
      z.object({
        type: z.enum(["fill_blank", "context_guess", "sentence_construction"]),
        prompt: z.string().min(1),
        answer: z.string(),
      }),
    )
    .min(3),
});

const sentenceFeedbackSchema = z.object({
  verdict: z.enum(["correct", "needs_work"]),
  correctedSentence: z.string().optional(),
  grammarNotes: z.array(z.string()),
  naturalnessNotes: z.array(z.string()),
  summary: z.string().min(1),
});

async function callClaude(prompt: string, maxTokens = 1200): Promise<string> {
  const response = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  return extractTextFromClaudeResponse(response);
}

export async function generateEnrichment(word: {
  french: string;
  english: string;
}): Promise<GeneratedEnrichment> {
  const responseText = await callClaude(enrichmentPrompt(word), 1200);
  const parsed = parseJsonObject<unknown>(responseText);

  return enrichmentSchema.parse(parsed);
}

export async function generateExercises(
  word: { french: string; english: string },
  perType = 3,
): Promise<GeneratedExercise[]> {
  const responseText = await callClaude(exercisePrompt(word, perType), 2400);
  const parsed = parseJsonObject<unknown>(responseText);
  const result = exerciseSchema.parse(parsed);

  return result.exercises.map((exercise) => ({
    type: exercise.type,
    prompt: exercise.prompt.trim(),
    answer: exercise.type === "sentence_construction" ? "" : exercise.answer.trim(),
  }));
}

export async function evaluateSentence(args: {
  french: string;
  english: string;
  exercisePrompt: string;
  userSentence: string;
}): Promise<SentenceFeedback> {
  const responseText = await callClaude(sentenceEvaluationPrompt(args), 1000);
  const parsed = parseJsonObject<unknown>(responseText);

  return sentenceFeedbackSchema.parse(parsed);
}
