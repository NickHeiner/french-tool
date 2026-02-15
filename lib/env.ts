
import { z } from "zod";

const fallbackQuizletUrl =
  "https://quizlet.com/1131039212/french-vocab-nick-flash-cards/?i=706z49&x=1jqU";

const raw = {
  appPassword: process.env.APP_PASSWORD ?? process.env.WEB_PASSWORD,
  databaseUrl:
    process.env.DATABASE_URL ??
    process.env.NEON_CONNECTION_STRING_DEV_BRANCH ??
    process.env.NEON_CONNECTION_STRING,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-latest",
  quizletSetUrl: process.env.QUIZLET_SET_URL ?? fallbackQuizletUrl,
  triggerSecretKey:
    process.env.TRIGGER_SECRET_KEY ??
    process.env.TRIGGER_SECRET_KEY_DEV ??
    process.env.TRIGGER_SECRET_KEY_TEST_BRANCH ??
    process.env.TRIGGER_SECRET_KEY_PROD,
  triggerProjectId: process.env.TRIGGER_PROJECT_ID,
  cronSecret: process.env.CRON_SECRET,
};

const schema = z.object({
  appPassword: z.string().min(1, "APP_PASSWORD (or WEB_PASSWORD) is required"),
  databaseUrl: z.string().min(1, "DATABASE_URL (or NEON_CONNECTION_STRING_DEV_BRANCH) is required"),
  anthropicApiKey: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  anthropicModel: z.string().min(1),
  quizletSetUrl: z.string().url(),
  triggerSecretKey: z.string().optional(),
  triggerProjectId: z.string().optional(),
  cronSecret: z.string().optional(),
});

export const env = schema.parse(raw);

export function getQuizletSetId(): string {
  const match = env.quizletSetUrl.match(/quizlet\.com\/(\d+)/i);
  if (!match) {
    throw new Error(`Could not parse Quizlet set id from URL: ${env.quizletSetUrl}`);
  }

  return match[1];
}
