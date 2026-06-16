/**
 * Indicizzazione via Google Indexing API (come Globary/Prezzioggi).
 * Invia fino a 200 URL/giorno (quota gratuita) presi dalla sitemap.
 *
 * Esecuzione:  npm run index-urls
 * Richiede secret GOOGLE_SERVICE_ACCOUNT_JSON (service account con ruolo
 * "Proprietario" sulla proprietà PREFISSO-URL in Search Console).
 *
 * JWT firmato con node:crypto, senza dipendenze esterne.
 */
import "dotenv/config";
import { createSign } from "node:crypto";
import { collectUrls } from "../src/lib/urls";

const DAILY_LIMIT = 200;
const SCOPE = "https://www.googleapis.com/auth/indexing";

type SA = { client_email: string; private_key: string };

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(sa: SA): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = b64url(signer.sign(sa.private_key));
  const jwt = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error("token: " + JSON.stringify(json));
  return json.access_token;
}

async function main() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON mancante.");
    process.exit(1);
  }
  const sa = JSON.parse(raw) as SA;
  const token = await getAccessToken(sa);

  const all = await collectUrls();
  // priorità: prima i profili e le classifiche (priority>=0.7)
  const urls = all
    .filter((u) => (u.priority ?? 0) >= 0.6)
    .map((u) => u.url)
    .slice(0, DAILY_LIMIT);

  let ok = 0;
  for (const url of urls) {
    const res = await fetch(
      "https://indexing.googleapis.com/v3/urlNotifications:publish",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, type: "URL_UPDATED" }),
      }
    );
    if (res.ok) ok++;
    else console.warn(`KO ${res.status} ${url}: ${await res.text()}`);
  }
  console.log(`Indicizzazione: ${ok}/${urls.length} URL inviati.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
