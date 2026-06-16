import { Container, Breadcrumbs } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Informativa sulla privacy",
  description: "Come notizihub tratta i dati personali e pubblici.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">
        Informativa sulla privacy
      </h1>
      <article className="mt-6 space-y-4 leading-relaxed text-paper/90">
        <p>
          {SITE.name} pubblica esclusivamente <strong>dati pubblici e
          aggregati</strong> (statistiche di follower, stream, visualizzazioni)
          provenienti dalle API ufficiali delle piattaforme e da dataset aperti.
          Non raccogliamo dati sensibili né informazioni private.
        </p>
        <h2 className="font-display text-2xl">Dati di navigazione</h2>
        <p>
          Per misurare il traffico usiamo strumenti di analisi che possono
          raccogliere dati in forma anonima o pseudonimizzata (IP anonimizzato).
          Per la pubblicità, i nostri partner possono usare cookie: vedi la{" "}
          <a href="/cookie" className="text-rise underline">
            Cookie Policy
          </a>
          .
        </p>
        <h2 className="font-display text-2xl">Diritti</h2>
        <p>
          Puoi richiedere la rimozione di una pagina che ti riguarda dalla
          pagina{" "}
          <a href="/rimozione" className="text-rise underline">
            Richiesta rimozione
          </a>{" "}
          o scrivendo a{" "}
          <a href={`mailto:${SITE.email}`} className="text-rise underline">
            {SITE.email}
          </a>
          . Procediamo rapidamente.
        </p>
        <h2 className="font-display text-2xl">Titolare</h2>
        <p>
          Per qualsiasi richiesta relativa ai dati scrivi a{" "}
          <a href={`mailto:${SITE.email}`} className="text-rise underline">
            {SITE.email}
          </a>
          .
        </p>
        <p className="text-sm text-muted">
          Questo documento può essere aggiornato. Ultima revisione:{" "}
          {new Date().toLocaleDateString("it-IT")}.
        </p>
      </article>
    </Container>
  );
}
