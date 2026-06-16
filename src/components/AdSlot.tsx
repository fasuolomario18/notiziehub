import Script from "next/script";

/**
 * Slot pubblicitario multi-network, gated da env (come Globary/Prezzioggi).
 * Strategia: Adsterra + HilltopAds da subito; AdSense opzionale più avanti.
 *  - NEXT_PUBLIC_ADSTERRA_KEY   → script Adsterra (banner)
 *  - NEXT_PUBLIC_HILLTOP_SRC    → src dello script HilltopAds della zona
 *  - NEXT_PUBLIC_ADSENSE_CLIENT → ca-pub-XXXX (se/quando approvato)
 * Se nessuna var è impostata, mostra un placeholder discreto (non in produzione).
 */
export function AdSlot({
  slot = "default",
  className = "",
}: {
  slot?: string;
  className?: string;
}) {
  const adsterra = process.env.NEXT_PUBLIC_ADSTERRA_KEY;
  const hilltop = process.env.NEXT_PUBLIC_HILLTOP_SRC;
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const hasAny = adsterra || hilltop || adsense;

  return (
    <aside
      className={`mx-auto my-6 flex min-h-[90px] w-full max-w-[728px] items-center justify-center overflow-hidden rounded-lg border border-line bg-surface/40 ${className}`}
      aria-label="Pubblicità"
      data-ad-slot={slot}
    >
      {adsterra ? (
        <Script id={`adsterra-${slot}`} strategy="afterInteractive">
          {`atOptions = { 'key':'${adsterra}','format':'iframe','height':90,'width':728,'params':{} };`}
        </Script>
      ) : null}
      {adsterra ? (
        <Script
          src={`https://www.highperformanceformat.com/${adsterra}/invoke.js`}
          strategy="afterInteractive"
        />
      ) : null}

      {hilltop ? (
        <Script src={hilltop} strategy="afterInteractive" />
      ) : null}

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

      {!hasAny ? (
        <span className="text-xs text-muted">spazio pubblicitario</span>
      ) : null}
    </aside>
  );
}
