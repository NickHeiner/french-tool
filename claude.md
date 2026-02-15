For substantial undertakings, keep a record of your key decisions & challenges in @agent-workspace/work-logs/*.md.

When you learn something that would be helpful for the next agent to come along (e.g. some surprising thing you need to do get a command to run in this env, etc), document it in this file. And generally keepe this file up to date with architectural notes etc, so future agents start with all the helpful context they need to be productive.

Commit your work in logical chunks as you go.

Look at your dirname to see which worktree you're operating in. You need to stay isolated from other agents. Trigger lets you use branches. To use this, use the `TRIGGER_SECRET_KEY_TEST_BRANCH` env var, with `TRIGGER_PREVIEW_BRANCH`  set to the worktree name.