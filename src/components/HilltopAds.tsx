"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "./useConsent";
import { HILLTOP_ZONES } from "@/lib/ads";

/**
 * HilltopAds MultiTag: le 4 zone di notizihub.com (le stesse di globary/prezzioggi).
 * Sono script auto-piazzanti → vanno iniettati una volta sola nel documento
 * principale (non in iframe), solo dopo consenso cookie. Ogni MultiTag gestisce
 * da sé rendering e posizione (video slider, banner, in-page push).
 */
export function HilltopAds() {
  const consent = useConsent();
  const done = useRef(false);
  useEffect(() => {
    if (consent !== "all" || done.current) return;
    done.current = true;
    for (const z of HILLTOP_ZONES) {
      const s = document.createElement("script");
      s.src = z.src;
      s.async = true;
      s.referrerPolicy = "no-referrer-when-downgrade";
      s.dataset.hilltop = z.name;
      document.body.appendChild(s);
    }
  }, [consent]);
  return null;
}
