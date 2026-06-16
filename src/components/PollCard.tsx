"use client";

import { useState } from "react";
import type { Poll } from "@/lib/polls";

export function PollCard({
  poll,
  initial,
}: {
  poll: Poll;
  initial: Record<string, number>;
}) {
  const [results, setResults] = useState(initial);
  const [voted, setVoted] = useState<string | null>(null);
  const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;

  async function cast(optionId: string) {
    if (voted) return;
    setVoted(optionId);
    // ottimistico
    setResults((r) => ({ ...r, [optionId]: (r[optionId] ?? 0) + 1 }));
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: poll.slug, optionId }),
      });
      const data = await res.json();
      if (data.ok) setResults(data.results);
    } catch {
      /* mantiene il valore ottimistico */
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="font-display text-lg">{poll.question}</h3>
      <ul className="mt-4 space-y-2">
        {poll.options.map((o) => {
          const v = results[o.id] ?? 0;
          const pct = Math.round((v / total) * 100);
          const isChoice = voted === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => cast(o.id)}
                disabled={!!voted}
                className="relative w-full overflow-hidden rounded-lg border border-line px-3 py-2 text-left disabled:cursor-default"
              >
                <span
                  className="absolute inset-y-0 left-0 -z-0 transition-all"
                  style={{
                    width: voted ? `${pct}%` : "0%",
                    background: isChoice
                      ? "rgba(45,227,176,0.25)"
                      : "rgba(138,134,160,0.18)",
                  }}
                />
                <span className="relative z-10 flex items-center justify-between">
                  <span>{o.label}</span>
                  {voted ? (
                    <span className="tabnum text-sm text-muted">{pct}%</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {voted ? (
        <p className="mt-3 tabnum text-xs text-muted">
          {total.toLocaleString("it-IT")} voti
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">Vota per vedere i risultati</p>
      )}
    </div>
  );
}
