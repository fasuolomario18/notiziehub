# notiziehub — il tabellone vivo della cultura giovane

Hub di **dati** su creator, artisti, brani e trend: classifiche, crescite, confronti, sondaggi.
Niente gossip — solo fatti, numeri e fonti, aggiornati in automatico (programmatic SEO).

Costruito secondo il documento di progetto (Fasi 0→5). Stack: **Next.js 16 (App Router) ·
TypeScript · Drizzle · Postgres · Recharts**, design "scoreboard live".

---

## Gira subito, anche senza nulla

Il sito **funziona già** con dati seed realistici (nessun DB né chiave richiesta):

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # build di produzione
```

Quando aggiungi `DATABASE_URL`, il data-layer passa **automaticamente** ai dati reali del
DB (vedi `src/lib/data.ts` e `src/lib/db.ts`). Stessa cosa per analytics e pubblicità: tutto
è "gated" da variabili d'ambiente, quindi non si carica finché non lo configuri.

Copia `.env.example` → `.env.local` e compila ciò che serve.

---

## Cosa è già fatto (tutto il codice)

- **Fase 0** — scaffolding, schema DB (`entities/stats/history/ranking_snapshots/polls`),
  job YouTube (`scripts/collect.ts`), pagine `/creator/[slug]` con grafico crescita.
- **Fase 1** — design system del brief (token colore, Bricolage/Geist/Geist Mono, cifre
  tabulari), home con **ticker**, **leaderboard live** e **odometro** (rispetta
  `prefers-reduced-motion`, mobile-first, focus visibile).
- **Fase 2** — `/track`, `/artist`, `/trend`, `/vs/[a]/[b]`,
  `/classifiche/[piattaforma]/[paese]/[periodo]`, `/tag/[categoria]`, ricerca, glossario.
  I "versus" si generano **solo** tra entità della stessa categoria e dimensioni simili.
- **Fase 3** — schema.org su ogni tipo di pagina, internal linking, **sitemap a chunk +
  index** (`/sitemap.xml` → `/sitemaps/0.xml`), `noindex` automatico sui dati insufficienti.
- **Fase 4** — archivi storici datati (il cron scrive una riga storica al giorno → nuovi URL
  nel tempo), **sondaggi** community (`/sondaggi`).
- **Fase 5** — pagina **richiesta rimozione** + API, privacy/cookie/termini, **AdSense +
  Adsterra + HilltopAds** (slot `AdSlot`), **analytics** GA4/Plausible.

---

## ⚠️ CHECKLIST DEL RISVEGLIO (cose che richiedono il TUO login)

Tutto il resto è pronto. Questi passi non li potevo fare di notte senza i tuoi account.
**Ordine consigliato:**

### 1. Database (5 min)
- Crea un progetto Postgres su **Neon** o **Supabase** (hai già Supabase).
- Metti la connection string in `.env.local` come `DATABASE_URL`.
- Crea le tabelle: `npm run db:push`.

### 2. Chiavi delle fonti dati (15 min)
- **YouTube Data API v3**: Google Cloud Console → abilita l'API → crea API key →
  `YOUTUBE_API_KEY`. Poi metti gli ID canale reali in `data/youtube-channels.json`.
- (Opzionali, dopo) **Spotify** e **Twitch** client id/secret.
- Lancia la prima raccolta: `npm run collect` (popola il DB con dati veri + primo storico).

### 3. Deploy
- **Vercel** (nativo Next.js/ISR) oppure **Coolify/Aruba** come gli altri siti.
- Imposta tutte le env di `.env.local` anche sull'hosting.

### 4. 🔴 Switch del dominio — DA FARE INSIEME (irreversibile)
- Hai scelto "sostituisce NotiziHub": puntare `notizihub.com` su questo sito **spegne il
  NotiziHub di news attuale**. Non l'ho fatto di proposito mentre dormivi.
- Quando sei pronto: punti il DNS / l'app Coolify al nuovo progetto. Consiglio: tieni un
  backup del vecchio repo prima.

### 5. Google Search Console (come Globary/Prezzioggi)
- Aggiungi la proprietà del dominio **e** la proprietà PREFISSO-URL `https://notizihub.com/`.
- Verifica col metodo "tag HTML": copia il `content` e mettilo in
  `NEXT_PUBLIC_GOOGLE_VERIFICATION` (genera `<meta name="google-site-verification">`).
- Invia la sitemap: **`https://notizihub.com/sitemap.xml`** (è già un sitemap index).

### 6. Indexing API (200 URL/giorno)
- Service account con ruolo **Proprietario** sulla proprietà **PREFISSO-URL** (non solo
  Dominio: l'Indexing API ignora le proprietà Dominio — stessa lezione di Prezzioggi).
- Metti il JSON del service account come secret GitHub `GOOGLE_SERVICE_ACCOUNT_JSON`.
- Il workflow `.github/workflows/indexing.yml` gira ogni giorno (`npm run index-urls`).

### 7. Analytics
- GA4: crea proprietà → `NEXT_PUBLIC_GA_ID` (es. `G-XXXX`). (Plausible opzionale.)

### 8. Pubblicità (Adsterra + HilltopAds, NO AdSense all'inizio)
- Crea le zone su Adsterra/Hilltop per il dominio e incolla le chiavi in
  `NEXT_PUBLIC_ADSTERRA_KEY` / `NEXT_PUBLIC_HILLTOP_SRC`. Gli slot sono già nel sito.

### 9. Legale (sez. 8 del brief)
- Mezz'ora con un avvocato di diritto digitale prima di spingere il traffico (minori,
  diffamazione). La pagina `/rimozione` e la procedura sono già pronte.

---

## Automazione (gira da solo)

`.github/workflows/collect.yml` ogni 12h: API ufficiali → upsert DB → riga storica datata →
ISR rigenera → sitemap aggiornate. Secrets richiesti: `DATABASE_URL`, `YOUTUBE_API_KEY`.

## Struttura

```
src/lib/         schema, data-layer (seed↔DB), fonti, sitemap, schema.org
src/components/  Ticker, Leaderboard, Odometer, GrowthChart, AdSlot, Analytics…
src/app/         home, creator/artist/track/trend, vs, classifiche, tag, legale, api
scripts/         collect.ts (cron), index-urls.ts (Indexing API)
data/            youtube-channels.json (canali da tracciare)
```

Una verità onesta dal brief: la macchina lavora da sola, ma la **prima spinta di
visibilità** (condivisioni delle classifiche più ghiotte) la dà solo una persona.
