"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "./useConsent";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(getConsent() === null);
  }, []);

  if (!show) return null;

  const choose = (v: "all" | "none") => {
    setConsent(v);
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Usiamo cookie tecnici e, con il tuo consenso, cookie di misurazione e
          pubblicità per sostenere il sito. Vedi la{" "}
          <Link href="/cookie" className="text-rise underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("none")}
            className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2"
          >
            Rifiuta
          </button>
          <button
            onClick={() => choose("all")}
            className="rounded-lg bg-rise px-4 py-2 text-sm font-medium text-ink hover:opacity-90"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
