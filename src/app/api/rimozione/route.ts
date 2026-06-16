import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

/**
 * Riceve una richiesta di rimozione (sez. 8).
 * Se RESEND_API_KEY è configurata, invia l'email a SITE.email; altrimenti
 * registra la richiesta nei log del server (sempre tracciata).
 */
export async function POST(req: Request) {
  let data: Record<string, string>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { url, email, role, reason } = data;
  if (!url || !email) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const body = [
    "Nuova richiesta di rimozione — notizihub",
    `URL: ${url}`,
    `Email richiedente: ${email}`,
    `Ruolo: ${role ?? "-"}`,
    `Motivo: ${reason ?? "-"}`,
    `Ricevuta: ${new Date().toISOString()}`,
  ].join("\n");

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "notizihub <onboarding@resend.dev>",
          to: SITE.email,
          subject: `Richiesta rimozione: ${url}`,
          text: body,
          reply_to: email,
        }),
      });
    } catch (err) {
      console.error("[rimozione] invio email fallito:", err);
    }
  } else {
    // Senza email provider: la richiesta resta nei log (da non perdere)
    console.warn("[rimozione] RICHIESTA (nessun email provider):\n" + body);
  }

  return NextResponse.json({ ok: true });
}
