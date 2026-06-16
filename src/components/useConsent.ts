"use client";

import { useEffect, useState } from "react";

export type Consent = "all" | "none" | null;
const KEY = "nh_consent";
const EVENT = "nh-consent";

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "all" || v === "none" ? v : null;
}

export function setConsent(value: "all" | "none") {
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

/** Hook reattivo: ritorna il consenso corrente e si aggiorna quando cambia. */
export function useConsent(): Consent {
  const [consent, setC] = useState<Consent>(null);
  useEffect(() => {
    setC(getConsent());
    const h = () => setC(getConsent());
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  return consent;
}
