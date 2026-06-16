"use client";

import { useState } from "react";

export function RemovalForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/rimozione", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
        headers: { "Content-Type": "application/json" },
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-lg border border-rise/40 bg-rise/10 p-4 text-rise">
        Richiesta inviata. La gestiamo il prima possibile e ti rispondiamo via
        email.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="mb-1 block text-sm">
          URL della pagina da rimuovere *
        </label>
        <input
          id="url"
          name="url"
          required
          type="url"
          placeholder="https://…"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-paper"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm">
          La tua email *
        </label>
        <input
          id="email"
          name="email"
          required
          type="email"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-paper"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1 block text-sm">
          Chi sei
        </label>
        <select
          id="role"
          name="role"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-paper"
        >
          <option value="interessato">Sono la persona interessata</option>
          <option value="rappresentante">Rappresento la persona</option>
          <option value="tutore">Sono genitore/tutore di un minore</option>
          <option value="altro">Altro</option>
        </select>
      </div>
      <div>
        <label htmlFor="reason" className="mb-1 block text-sm">
          Motivo della richiesta
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-paper"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-signal px-5 py-2.5 font-medium text-ink transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Invio…" : "Invia richiesta"}
      </button>
      {status === "error" ? (
        <p className="text-sm text-signal">
          Errore nell&apos;invio. Scrivici direttamente via email.
        </p>
      ) : null}
    </form>
  );
}
