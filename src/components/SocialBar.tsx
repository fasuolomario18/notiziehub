"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "./useConsent";

/**
 * Social Bar Adsterra: caricato UNA volta a livello di sito, solo dopo consenso.
 * È un overlay flottante → va iniettato nel documento principale (non in iframe).
 */
export function SocialBar() {
  const consent = useConsent();
  const done = useRef(false);
  useEffect(() => {
    if (consent !== "all" || done.current) return;
    done.current = true;
    const s = document.createElement("script");
    s.src =
      "https://pl29536066.effectivecpmnetwork.com/6c/e3/8c/6ce38c0ec6c83802f669d05097499560.js";
    document.body.appendChild(s);
  }, [consent]);
  return null;
}
