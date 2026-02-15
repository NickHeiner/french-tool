For substantial undertakings, keep a record of your key decisions & challenges in @agent-workspace/work-logs/*.md.

You are one of several agents operating simultaneously. You have your own git worktree. Service isolation:
* Trigger offers branches. Your branch name is set in your env var.
* Neon offers branches. Your connection string is in the `NEON_CONNECTION_STRING_DEV_BRANCH` env var.
* Vercel is just a single deployment, so don't deploy to prod unless you've been authorized to do so.

When you learn something that would be helpful for the next agent to come along (e.g. some surprising thing you need to do get a command to run in this env, etc), document it in this file. And generally keepe this file up to date with architectural notes etc, so future agents start with all the helpful context they need to be productive.

Commit your work in logical chunks as you go.

