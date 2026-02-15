
import { configure, tasks } from "@trigger.dev/sdk/v3";

import { env } from "@/lib/env";

let configured = false;

export function triggerTasks() {
  if (!env.triggerSecretKey) {
    throw new Error(
      "TRIGGER_SECRET_KEY is not configured. Set TRIGGER_SECRET_KEY or TRIGGER_SECRET_KEY_DEV.",
    );
  }

  if (!configured) {
    configure({ accessToken: env.triggerSecretKey });
    configured = true;
  }

  return tasks;
}
