"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "./useConsent";
import { ADS, BANNER_SIZE, type AdName } from "@/lib/ads";

const BANNERS: AdName[] = [
  "banner728x90",
  "banner300x250",
  "banner468x60",
  "banner320x50",
  "banner160x300",
  "banner160x600",
];
let rotation = 0;

const nativeUsedByPath = new Map<string, boolean>();

/**
 * Slot pubblicitario Adsterra, gated dal consenso.
 * - name="native": Native Banner inline (max 1 per pagina, id container unico).
 * - name="bannerWxH": quel banner.
 * - nessun name: ruota tra i 6 banner (così tutti i formati compaiono nel sito).
 * I banner sono iniettati in un IFRAME isolato → niente collisioni di atOptions.
 */
export function AdSlot({ name, slot = "ad", className = "" }: { name?: AdName; slot?: string; className?: string }) {
  const consent = useConsent();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  // Fissa il formato di questo slot al mount (rotazione se non specificato).
  const [resolved] = useState<AdName>(() => name ?? BANNERS[rotation++ % BANNERS.length]);
  const isNative = resolved === "native";
  const size = BANNER_SIZE[resolved];

  useEffect(() => {
    if (consent !== "all" || injected.current || !ref.current) return;

    if (isNative) {
      if (nativeUsedByPath.get(pathname)) return; // un solo native per pagina
      nativeUsedByPath.set(pathname, true);
      injected.current = true;
      const wrap = document.createElement("div");
      wrap.innerHTML = ADS.native;
      // i tag <script> da innerHTML non si eseguono: ricreali
      Array.from(wrap.querySelectorAll("script")).forEach((old) => {
        const s = document.createElement("script");
        for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
        s.text = old.text;
        old.replaceWith(s);
      });
      ref.current.appendChild(wrap);
      return () => {
        nativeUsedByPath.set(pathname, false);
      };
    }

    // banner → iframe isolato
    injected.current = true;
    const iframe = document.createElement("iframe");
    iframe.width = String(size?.w ?? 300);
    iframe.height = String(size?.h ?? 250);
    iframe.scrolling = "no";
    iframe.frameBorder = "0";
    iframe.style.border = "0";
    iframe.style.overflow = "hidden";
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center}</style></head><body>${ADS[resolved]}</body></html>`;
    ref.current.appendChild(iframe);
  }, [consent, isNative, resolved, size, pathname]);

  if (consent !== "all") return null;

  return (
    <aside
      ref={ref}
      className={`mx-auto my-6 flex w-full items-center justify-center overflow-hidden ${className}`}
      style={!isNative && size ? { maxWidth: size.w } : { maxWidth: 728 }}
      aria-label="Pubblicità"
      data-ad-slot={slot}
    />
  );
}
