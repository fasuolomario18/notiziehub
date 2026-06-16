import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link href="/" className="font-display text-lg">
            notizi<span className="text-signal">hub</span>
          </Link>
          <p className="mt-2 text-sm text-muted">{SITE.tagline}.</p>
          <p className="mt-2 text-xs text-muted">
            Dati pubblici e aggregati, aggiornati in automatico. Ogni pagina linka
            la fonte ufficiale.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Esplora</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li><Link href="/creator" className="hover:text-paper">Creator</Link></li>
            <li><Link href="/artist" className="hover:text-paper">Artisti</Link></li>
            <li><Link href="/track" className="hover:text-paper">Brani</Link></li>
            <li><Link href="/video" className="hover:text-paper">Video virali</Link></li>
            <li><Link href="/classifiche" className="hover:text-paper">Classifiche</Link></li>
            <li><Link href="/trend" className="hover:text-paper">Trend</Link></li>
            <li><Link href="/aggiungi" className="hover:text-paper">Aggiungi un canale</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Approfondisci</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li><Link href="/vs" className="hover:text-paper">Confronti</Link></li>
            <li><Link href="/sondaggi" className="hover:text-paper">Sondaggi</Link></li>
            <li><Link href="/cos-e" className="hover:text-paper">Glossario</Link></li>
            <li><Link href="/metodo" className="hover:text-paper">Come funziona</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Legale</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li><Link href="/rimozione" className="hover:text-paper">Segnala / Richiedi rimozione</Link></li>
            <li><Link href="/privacy" className="hover:text-paper">Privacy</Link></li>
            <li><Link href="/cookie" className="hover:text-paper">Cookie</Link></li>
            <li><Link href="/termini" className="hover:text-paper">Termini</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name} — Dati pubblici aggregati a scopo
        informativo. Non affiliato alle piattaforme citate.
      </div>
    </footer>
  );
}
