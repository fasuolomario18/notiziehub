"use client";

import { useState } from "react";
import Link from "next/link";

export function AddChannelForm() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [href, setHref] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/aggiungi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        setMsg(`${data.name} è stato aggiunto!`);
        setHref(data.href);
        setInput("");
      } else {
        setStatus("error");
        setMsg(data.error ?? "Errore.");
      }
    } catch {
      setStatus("error");
      setMsg("Errore di rete.");
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="@iltuocanale  ·  youtube.com/@…  ·  ID canale"
          className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-paper placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-signal px-5 py-2.5 font-medium text-ink transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Aggiungo…" : "Aggiungi"}
        </button>
      </form>
      {status === "ok" ? (
        <p className="mt-3 text-rise">
          ✅ {msg}{" "}
          <Link href={href} className="underline">
            Vai alla pagina →
          </Link>
        </p>
      ) : null}
      {status === "error" ? <p className="mt-3 text-signal">⚠️ {msg}</p> : null}
    </div>
  );
}
