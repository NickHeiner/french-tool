"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function WordSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(value: string) {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`/words?${params.toString()}`);
  }

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search words..."
      className="input-field"
    />
  );
}
