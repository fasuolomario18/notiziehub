"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "./useConsent";

/**
 * Slot pubblicitario equilibrato (Native Banner container-based), caricato SOLO
 * dopo consenso. Niente formati aggressivi. UNA sola pubblicità per pagina:
 * il Native Banner usa un id container unico, quindi solo il primo AdSlot della
 * pagina la mostra (= esperienza pulita, non invasiva).
 * Env: NEXT_PUBLIC_ADSTERRA_SRC + NEXT_PUBLIC_ADSTERRA_KEY (fallback Hilltop).
 */
const claimedByPath = new Map<string, number>();

export function AdSlot({ slot = "default", className = "" }: { slot?: string; className?: string }) {
  const consent = useConsent();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const [isFirst, setIsFirst] = useState(false);

  const adsterraSrc = process.env.NEXT_PUBLIC_ADSTERRA_SRC;
  const adsterraKey = process.env.NEXT_PUBLIC_ADSTERRA_KEY;
  const hilltopSrc = process.env.NEXT_PUBLIC_HILLTOP_SRC;
  const hilltopKey = process.env.NEXT_PUBLIC_HILLTOP_KEY;
  const src = adsterraSrc || hilltopSrc;
  const key = adsterraSrc ? adsterraKey : hilltopKey;

  // Reclama lo "slot pubblicitario unico" per questo pathname al mount.
  useEffect(() => {
    const n = claimedByPath.get(pathname) ?? 0;
    if (n === 0) {
      claimedByPath.set(pathname, 1);
      setIsFirst(true);
      return () => {
        claimedByPath.set(pathname, (claimedByPath.get(pathname) ?? 1) - 1);
      };
    }
    return undefined;
  }, [pathname]);

  useEffect(() => {
    if (!isFirst || consent !== "all" || !src || !key || injected.current || !ref.current) return;
    injected.current = true;
    const container = document.createElement("div");
    container.id = `container-${key}`;
    ref.current.appendChild(container);
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = src;
    ref.current.appendChild(s);
  }, [isFirst, consent, src, key]);

  if (!isFirst || consent !== "all" || !src || !key) return null;

  return (
    <aside
      ref={ref}
      className={`mx-auto my-6 w-full max-w-3xl overflow-hidden rounded-lg ${className}`}
      aria-label="Pubblicità"
      data-ad-slot={slot}
    />
  );
}
