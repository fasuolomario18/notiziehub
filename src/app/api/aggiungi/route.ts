import { NextResponse } from "next/server";
import { hasDb, db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { fetchByHandle, fetchChannels } from "@/lib/sources/youtube";
import { upsertCreator } from "@/lib/sources/persist";
import { entityHref } from "@/lib/links";

/**
 * Aggiunta pubblica di un canale: chiunque incolla handle/URL/ID YouTube
 * e viene risolto via API ufficiale e salvato. (Auto-popolamento "chiunque".)
 */
export async function POST(req: Request) {
  if (!hasDb || !db) {
    return NextResponse.json(
      { ok: false, error: "Database non configurato." },
      { status: 503 }
    );
  }
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ ok: false, error: "Fonte non disponibile." }, { status: 503 });
  }

  let input = "";
  try {
    input = String((await req.json()).input ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Richiesta non valida." }, { status: 400 });
  }
  if (!input) {
    return NextResponse.json({ ok: false, error: "Inserisci un canale." }, { status: 400 });
  }

  try {
    // Riconosci channel ID, handle o URL
    const channelIdMatch = input.match(/(?:channel\/)?(UC[0-9A-Za-z_-]{20,})/);
    const handleMatch = input.match(/@([A-Za-z0-9._-]+)/);

    let stat = null;
    if (channelIdMatch) {
      stat = (await fetchChannels([channelIdMatch[1]]))[0] ?? null;
    } else if (handleMatch) {
      stat = await fetchByHandle(handleMatch[1]);
    } else {
      // prova come handle "nudo"
      stat = await fetchByHandle(input.replace(/^@/, ""));
    }

    if (!stat) {
      return NextResponse.json(
        { ok: false, error: "Canale non trovato. Controlla l'handle o l'URL." },
        { status: 404 }
      );
    }

    await upsertCreator(db, schema, stat, "community");
    const href = entityHref({ kind: "creator", slug: slugifyName(stat.title) });
    return NextResponse.json({ ok: true, name: stat.title, href });
  } catch (err) {
    console.error("[aggiungi]", err);
    return NextResponse.json({ ok: false, error: "Errore durante l'aggiunta." }, { status: 500 });
  }
}

// stessa logica di slugify usata in persist/youtube
function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
