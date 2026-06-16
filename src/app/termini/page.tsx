import { Container, Breadcrumbs } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Termini e condizioni",
  description: "Termini d'uso del sito notizihub.",
  alternates: { canonical: "/termini" },
};

export default function Page() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Termini", path: "/termini" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">
        Termini e condizioni
      </h1>
      <article className="mt-6 space-y-4 leading-relaxed text-paper/90">
        <p>
          {SITE.name} fornisce dati pubblici e aggregati a scopo informativo. I
          contenuti sono offerti &quot;così come sono&quot;, senza garanzie di
          completezza o assenza di errori.
        </p>
        <h2 className="font-display text-2xl">Fonti e marchi</h2>
        <p>
          I marchi, i nomi e i loghi citati appartengono ai rispettivi titolari.{" "}
          {SITE.name} non è affiliato alle piattaforme menzionate. Ogni dato
          riporta il link alla fonte ufficiale.
        </p>
        <h2 className="font-display text-2xl">Uso consentito</h2>
        <p>
          Puoi consultare e condividere le pagine. Non è consentito lo scraping
          massivo o la riproduzione integrale dei contenuti senza autorizzazione.
        </p>
        <h2 className="font-display text-2xl">Rimozioni</h2>
        <p>
          Le richieste di rimozione vengono gestite tramite la pagina{" "}
          <a href="/rimozione" className="text-rise underline">
            Richiesta rimozione
          </a>
          .
        </p>
        <p className="text-sm text-muted">
          Contatti:{" "}
          <a href={`mailto:${SITE.email}`} className="text-rise underline">
            {SITE.email}
          </a>
          .
        </p>
      </article>
    </Container>
  );
}
