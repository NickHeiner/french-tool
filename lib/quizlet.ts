
import { getQuizletSetId } from "@/lib/env";
import type { QuizletCard } from "@/lib/types";

const quizletUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const apiVersions = ["3.5", "3.4", "3.2"];

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function cardKey(card: QuizletCard): string {
  return `${card.french.toLowerCase()}::${card.english.toLowerCase()}`;
}

function extractSideText(side: unknown): string | null {
  if (!side || typeof side !== "object") {
    return null;
  }

  const candidate = side as {
    media?: Array<{ plainText?: string; text?: string; [key: string]: unknown }>;
    plainText?: string;
    text?: string;
  };

  const mediaText = candidate.media?.find((entry) => entry.plainText || entry.text);
  if (mediaText?.plainText || mediaText?.text) {
    return normalize(mediaText.plainText ?? mediaText.text ?? "");
  }

  if (candidate.plainText || candidate.text) {
    return normalize(candidate.plainText ?? candidate.text ?? "");
  }

  return null;
}

function collectCardCandidates(node: unknown, acc: Array<{ left: string; right: string }>) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (const value of node) {
      collectCardCandidates(value, acc);
    }
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  const record = node as Record<string, unknown>;

  if (Array.isArray(record.cardSides) && record.cardSides.length >= 2) {
    const left = extractSideText(record.cardSides[0]);
    const right = extractSideText(record.cardSides[1]);
    if (left && right) {
      acc.push({ left, right });
    }
  }

  if (typeof record.word === "string" && typeof record.definition === "string") {
    acc.push({ left: normalize(record.word), right: normalize(record.definition) });
  }

  for (const value of Object.values(record)) {
    collectCardCandidates(value, acc);
  }
}

function parseCards(payload: unknown): QuizletCard[] {
  const candidates: Array<{ left: string; right: string }> = [];
  collectCardCandidates(payload, candidates);

  const cards: QuizletCard[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const french = normalize(candidate.left);
    const english = normalize(candidate.right);
    if (!french || !english) {
      continue;
    }

    const key = cardKey({ french, english });
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cards.push({ french, english });
  }

  return cards;
}

async function fetchQuizletApi(setId: string): Promise<QuizletCard[]> {
  const errors: string[] = [];

  for (const version of apiVersions) {
    const url = `https://quizlet.com/webapi/${version}/studiable-item-documents?filters[set][id]=${setId}&filters[studiableContainerType]=1&perPage=1000&page=1`;
    const response = await fetch(url, {
      headers: {
        "user-agent": quizletUserAgent,
        accept: "application/json,text/plain,*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const snippet = (await response.text()).slice(0, 160).replace(/\s+/g, " ");
      errors.push(`v${version} -> status ${response.status}: ${snippet}`);
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (text.includes("cf-mitigated") || text.includes("Just a moment")) {
        errors.push(`v${version} -> Cloudflare challenge page`);
        continue;
      }

      errors.push(`v${version} -> non-JSON response`);
      continue;
    }

    const payload = (await response.json()) as unknown;
    const cards = parseCards(payload);

    if (cards.length > 0) {
      return cards;
    }

    errors.push(`v${version} -> parsed 0 cards`);
  }

  throw new Error(`Quizlet API fetch failed. ${errors.join(" | ")}`);
}

async function fetchFromSetPage(setUrl: string): Promise<QuizletCard[]> {
  const response = await fetch(setUrl, {
    headers: {
      "user-agent": quizletUserAgent,
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Quizlet set page request failed with status ${response.status}`);
  }

  const html = await response.text();

  if (html.includes("cf-mitigated") || html.includes("Just a moment")) {
    throw new Error("Quizlet set page blocked by Cloudflare challenge");
  }

  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (!nextDataMatch) {
    throw new Error("Could not locate __NEXT_DATA__ payload in Quizlet page HTML");
  }

  const payload = JSON.parse(nextDataMatch[1]) as unknown;
  const cards = parseCards(payload);

  if (cards.length === 0) {
    throw new Error("Parsed 0 cards from Quizlet HTML payload");
  }

  return cards;
}

export async function fetchQuizletCards(quizletSetUrl: string): Promise<QuizletCard[]> {
  const setId = getQuizletSetId();

  try {
    return await fetchQuizletApi(setId);
  } catch (apiError) {
    try {
      return await fetchFromSetPage(quizletSetUrl);
    } catch (htmlError) {
      throw new Error(
        `Quizlet ingestion failed. API error: ${String(apiError)}. HTML fallback error: ${String(htmlError)}`,
      );
    }
  }
}
