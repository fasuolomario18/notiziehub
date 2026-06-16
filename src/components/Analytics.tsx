"use client";

import Script from "next/script";
import { useConsent } from "./useConsent";

/**
 * Analytics caricato SOLO dopo consenso cookie ("Accetta").
 * - NEXT_PUBLIC_GA_ID            → Google Analytics 4
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN → Plausible (opzionale, privacy-friendly)
 */
export function Analytics() {
  const consent = useConsent();
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (consent !== "all") return null;

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
      {plausible ? (
        <Script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
