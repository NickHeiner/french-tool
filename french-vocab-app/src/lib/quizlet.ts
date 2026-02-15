import { parse } from "node-html-parser";

export type QuizletTerm = {
  french: string;
  english: string;
};

export async function fetchQuizletTerms(
  setUrl: string
): Promise<QuizletTerm[]> {
  const response = await fetch(setUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Quizlet page: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const root = parse(html);

  const termElements = root.querySelectorAll(".TermText");
  const terms: QuizletTerm[] = [];

  for (let i = 0; i < termElements.length; i += 2) {
    const french = termElements[i]?.text?.trim();
    const english = termElements[i + 1]?.text?.trim();
    if (french && english) {
      terms.push({ french, english });
    }
  }

  if (terms.length === 0) {
    throw new Error(
      "No terms found on page. Quizlet may have changed their HTML structure."
    );
  }

  return terms;
}
