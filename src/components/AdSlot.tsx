"use client";

import Script from "next/script";
import { useConsent } from "./useConsent";

/**
 * Slot pubblicitario, caricato SOLO dopo consenso cookie. Equilibrato (banner,
 * non aggressivo). Gated da env:
 *  - NEXT_PUBLIC_ADSTERRA_KEY → banner Adsterra
 *  - NEXT_PUBLIC_HILLTOP_SRC  → script banner HilltopAds
 *  - NEXT_PUBLIC_ADSENSE_CLIENT → opzionale
 */
export function AdSlot({
  slot = "default",
  className = "",
}: {
  slot?: string;
  className?: string;
}) {
  const consent = useConsent();
  const adsterra = process.env.NEXT_PUBLIC_ADSTERRA_KEY;
  const hilltop = process.env.NEXT_PUBLIC_HILLTOP_SRC;
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const hasAny = adsterra || hilltop || adsense;

  // Senza consenso o senza network configurato: niente (nessun placeholder in prod).
  if (consent !== "all" || !hasAny) return null;

  return (
    <aside
      className={`mx-auto my-6 flex min-h-[90px] w-full max-w-[728px] items-center justify-center overflow-hidden rounded-lg border border-line bg-surface/40 ${className}`}
      aria-label="Pubblicità"
      data-ad-slot={slot}
    >
      {adsterra ? (
        <>
          <Script id={`adsterra-opt-${slot}`} strategy="afterInteractive">
            {`atOptions = { 'key':'${adsterra}','format':'iframe','height':90,'width':728,'params':{} };`}
          </Script>
          <Script
            src={`https://www.highperformanceformat.com/${adsterra}/invoke.js`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
      {hilltop ? <Script src={hilltop} strategy="afterInteractive" /> : null}
      {adsense ? (
        <>
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adsense}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          <Script id={`adsense-push-${slot}`} strategy="afterInteractive">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </>
      ) : null}
    </aside>
  );
}
