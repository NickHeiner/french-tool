---
name: software-dev-lifecycle
description: Build software features or fix bugs (project)
---

<sdlc-workflow>
  <overview>
    <step number="1">Understand what you're being asked to do</step>
    <step number="2">Determine how you will check your own work. This is VERY IMPORTANT, because without the ability to check your own work, you'll just write code and hope it works, and it generally won't.</step>
    <step number="3">Write code to implement the feature or fix the bug. DO NOT STOP until you're done, even if it takes a long time.</step>
    <step number="4">Check your own work</step>
    <step number="5">Add whatever tests/types/static analysis/etc is possible to verify correctness</step>
    <step number="6">Commit and push your work</step>
    <step number="7">Verify one last time in prod, if possible</step>
    <step number="8">CALL THE WORK-VERIFIER AGENT TO VERIFY YOUR WORK. If it doesn't say you met all the criteria, go back and fix it.</step>
  </overview>

  <important-note>If I give you a bunch of things to do at once, follow this workflow separately for each task.</important-note>
</sdlc-workflow>

<understand-the-task>
  <guidance>If you're asked to implement a feature, make sure you deeply understand the surrounding system. Think through the implications of the various changes you could make - if you're guessing, do more research.</guidance>
  <guidance>In general, backwards compat is NOT important. This is a personal project, so we can almost always just migrate all existing data (or just delete it and start fresh).</guidance>
</understand-the-task>

<general-principles>
  <li>Strongly prefer to reuse existing codepaths and components whenever possible. We want to build a centralized platform for building features on top of, not a bunch of one-off codepaths. It's fine to rearchitect existing logic to extract a reusable component.</li>
  <li>Strongly prefer to use standard libraries and tools whenever possible – even if that means delivering a slightly different end result than what the user requested. For example, if the user asks for numbers to be pretty-printed, and gives a particular format, and there's a standard library that produces a slightly different format, use the standard library instead of implementing your own.</li>
</general-principles>

<check-your-work>
  <preferred-method>Launch a browser and manually verify the feature works as expected, as a user. IT IS OK IF THIS TAKES HOURS because the feature runs for a long time. I value your autonomy. I DO NOT want to hear from you until the task is VERIFIED AS SUCCESSFUL.</preferred-method>
  <alternative-method>Verify your work via unit tests. But don't add tests that are so mock-heavy that they're not actually testing the code you wrote, or are otherwise very complex relative to their assertion value.</alternative-method>
  <fallback>If you really can't figure out how to verify your own work, ask the user for help.</fallback>
</check-your-work>

<write-code>
  <rule>DO NOT write "smoke-and-mirrors" code that silently looks like it's working but doesn't actually work. If you need to write stub code, make sure it's incredibly obvious in the UI and the code.</rule>
  <rule>If you're fixing a bug, do TDD if possible: write the failing test first.</rule>
</write-code>

<critical-requirements>
  <requirement>If the feature or bug is user-facing, YOU SHOULD ALWAYS TEST VIA THE BROWSER, unless you have a really good reason that it's not possible (which you should explain to the user).</requirement>
  <requirement>You should ALMOST ALWAYS HAVE UNIT TEST COVERAGE.</requirement>
</critical-requirements>
