export type ExerciseType = "fill_blank" | "context_guess" | "sentence_construction";

export type Word = {
  id: string;
  french: string;
  english: string;
  quizletSetId: string;
  createdAt: string;
};

export type Enrichment = {
  id: string;
  wordId: string;
  exampleSentences: string[];
  usageNote: string;
  relatedForms: string[];
  createdAt: string;
};

export type Exercise = {
  id: string;
  wordId: string;
  type: ExerciseType;
  prompt: string;
  answer: string;
  createdAt: string;
};

export type SentenceAttempt = {
  id: string;
  exerciseId: string;
  userInput: string;
  llmFeedback: SentenceFeedback;
  createdAt: string;
};

export type SentenceFeedback = {
  verdict: "correct" | "needs_work";
  correctedSentence?: string;
  grammarNotes: string[];
  naturalnessNotes: string[];
  summary: string;
};

export type GeneratedEnrichment = {
  exampleSentences: string[];
  usageNote: string;
  relatedForms: string[];
};

export type GeneratedExercise = {
  type: ExerciseType;
  prompt: string;
  answer: string;
};

export type QuizletCard = {
  french: string;
  english: string;
};

export type WordSummary = Word & {
  exerciseCount: number;
};

export type WordDetail = {
  word: Word;
  enrichment: Enrichment | null;
  exercises: Exercise[];
};
