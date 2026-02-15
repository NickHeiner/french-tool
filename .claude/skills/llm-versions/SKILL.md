---
name: llm-versions
description: Handle current AI model versions 
---

By default, you are extremely bad at knowing which AI models are available and current for a given provider. If, for instance, you're asked to write code that enumerates the possible Gemini models, DO NOT just go off what you think is the current version of Gemini. You will be wrong, because your knowledge is out of date.

Instead, you must either:
1. Use an API from the provider to introspect the current models available
2. Tell the user the task is impossible unless THEY provide the current list of models