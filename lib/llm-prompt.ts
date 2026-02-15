const learnerContext = `You are helping a French learner at CEFR B1 level. They are conversational but rusty.\n\nExample sentences should use common vocabulary and straightforward grammar, but not tourist-phrase simplicity. Include subjunctive, conditional, and simple future where natural. Avoid complex literary tenses and technical/business jargon unless the target word needs it.\n\nWhen evaluating user-written sentences, be direct about errors. If it is correct, state that briefly.`;

export function enrichmentPrompt(word: { french: string; english: string }): string {
  return `${learnerContext}\n\nTarget word:\nFrench: ${word.french}\nEnglish: ${word.english}\n\nReturn strict JSON with keys:\n- exampleSentences: array of 2 to 3 French sentences naturally using the target word\n- usageNote: concise paragraph covering register/collocations/gotchas\n- relatedForms: array of string notes (conjugation highlights, gender forms, derivatives)\n\nDo not include markdown.`;
}

export function exercisePrompt(
  word: { french: string; english: string },
  perType: number,
): string {
  return `${learnerContext}\n\nTarget word:\nFrench: ${word.french}\nEnglish: ${word.english}\n\nGenerate ${perType} exercises of each type: fill_blank, context_guess, sentence_construction.\n\nRules:\n- fill_blank: prompt must be a French sentence containing one blank written as ____ ; answer must be the missing word/phrase.\n- context_guess: prompt must be a French sentence using the target word; answer must be short English meaning + one sentence explanation.\n- sentence_construction: prompt must ask learner to use the target word in a sentence about a concrete topic; answer should be an empty string.\n\nReturn strict JSON with key \"exercises\" containing array of objects:\n{\"type\":\"fill_blank|context_guess|sentence_construction\",\"prompt\":\"...\",\"answer\":\"...\"}\n\nNo markdown.`;
}

export function sentenceEvaluationPrompt(args: {
  french: string;
  english: string;
  exercisePrompt: string;
  userSentence: string;
}): string {
  return `${learnerContext}\n\nTarget word:\nFrench: ${args.french}\nEnglish: ${args.english}\n\nExercise prompt:\n${args.exercisePrompt}\n\nUser sentence:\n${args.userSentence}\n\nReturn strict JSON with keys:\n- verdict: \"correct\" or \"needs_work\"\n- correctedSentence: optional corrected French sentence when verdict is needs_work\n- grammarNotes: array of concise correction notes\n- naturalnessNotes: array of concise style/naturalness notes\n- summary: one short direct sentence\n\nNo markdown.`;
}
