import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-7xl text-signal">404</p>
      <h1 className="mt-3 font-display text-2xl">Pagina non trovata</h1>
      <p className="mt-2 text-muted">
        Forse il creator non è ancora nel nostro tabellone, o il link è
        cambiato.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-signal px-5 py-2.5 font-medium text-ink"
        >
          Torna alla home
        </Link>
        <Link
          href="/cerca"
          className="rounded-lg border border-line px-5 py-2.5"
        >
          Cerca
        </Link>
      </div>
    </Container>
  );
}
