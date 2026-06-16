/**
 * Codici pubblicitari Adsterra per notizihub.com (snippet pubblici lato client).
 * Banner = atOptions + invoke.js (iniettati in iframe isolato per evitare
 * collisioni del global atOptions). Native/Social = script (+ container) inline.
 */
export type AdName =
  | "socialBar"
  | "native"
  | "banner728x90"
  | "banner300x250"
  | "banner320x50"
  | "banner160x600"
  | "banner468x60"
  | "banner160x300";

function banner(key: string, w: number, h: number): string {
  return (
    `<script type="text/javascript">atOptions = {'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};</script>` +
    `<script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>`
  );
}

export const ADS: Record<AdName, string> = {
  socialBar:
    '<script src="https://pl29536066.effectivecpmnetwork.com/6c/e3/8c/6ce38c0ec6c83802f669d05097499560.js"></script>',
  native:
    '<script async="async" data-cfasync="false" src="https://pl29536065.effectivecpmnetwork.com/b5febad6acfc48e5dce9b37e980c630f/invoke.js"></script>\n<div id="container-b5febad6acfc48e5dce9b37e980c630f"></div>',
  banner728x90: banner("cd247e2d08d1e8d76463914e6e5647a9", 728, 90),
  banner300x250: banner("263f79236adf2ef5bd4ae36dc1481794", 300, 250),
  banner320x50: banner("229b70e2647a88cbcd30984081249a34", 320, 50),
  banner160x600: banner("4a92d2254ed381d7151ed6a02f2586f4", 160, 600),
  banner468x60: banner("5eb35b9b81f3aea9ded41c3508b4fe27", 468, 60),
  banner160x300: banner("50a5fa69209f160ec268f7a119ac1d33", 160, 300),
};

/**
 * HilltopAds MultiTag per notizihub.com (site id 902060) — le stesse 4 zone di
 * globary/prezzioggi. Ogni script è auto-piazzante (MultiTag): va caricato una
 * volta nel documento principale, gestisce da solo rendering e posizione.
 * Caricati solo dopo consenso cookie (vedi components/HilltopAds.tsx).
 */
export const HILLTOP_ZONES: { name: string; src: string }[] = [
  // Video Slider (MultiTag VAST) — zona #7143449
  {
    name: "videoSlider",
    src: "//untimely-hello.com/bSX.VVsSdzGIlR0/YVW/cK/YeAm/9euvZBUMllkUP/T/c_xsNTDRM/0FNrDvk/tSNvzIEB0/MEzjQv1nM/wh",
  },
  // Banner 300x100 (Banner MultiTag) — zona #7143465
  {
    name: "banner300x100",
    src: "//untimely-hello.com/byXaVrsJd.Gjl/0IYdWpcx/Be/ml9YuiZvUZlCkHPWT/cQxCNvDCM_0nN/jGU/tQN/zNEP0/MKz/Qn2jOCQR",
  },
  // Banner 300x250 (Banner MultiTag) — zona #7143477
  {
    name: "banner300x250hilltop",
    src: "//untimely-hello.com/b_XPVNs.dzGIla0JY/WFcP/-eyma9quVZ/UqlbkYPGTLclxxNPDCMk0/NrzAcwtgNCzkEa0aMRzlQn4PMsQL",
  },
  // In-Page Push (MultiTag nella pagina) — zona #7143493
  {
    name: "inPagePush",
    src: "//untimely-hello.com/bRX.Vqs/d_GilB0JYrW/cy/eepm/9-uLZzUbl/kQPOTFcdxnN/DGMC0MOTT/MwtANtzgEH0mMuzsQ/5KNBwV",
  },
];

/** Dimensioni dei banner (per l'iframe). */
export const BANNER_SIZE: Partial<Record<AdName, { w: number; h: number }>> = {
  banner728x90: { w: 728, h: 90 },
  banner300x250: { w: 300, h: 250 },
  banner320x50: { w: 320, h: 50 },
  banner160x600: { w: 160, h: 600 },
  banner468x60: { w: 468, h: 60 },
  banner160x300: { w: 160, h: 300 },
};
