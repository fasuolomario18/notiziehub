import { Container, Breadcrumbs } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Cookie Policy",
  description: "Come notiziehub usa i cookie e le tecnologie simili.",
  alternates: { canonical: "/cookie" },
};

export default function Page() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Cookie", path: "/cookie" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Cookie Policy</h1>
      <article className="mt-6 space-y-4 leading-relaxed text-paper/90">
        <p>
          {SITE.name} utilizza cookie tecnici necessari al funzionamento del
          sito e, previo consenso dove richiesto, cookie di terze parti per
          misurazione del traffico e pubblicità.
        </p>
        <h2 className="font-display text-2xl">Tipologie</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Tecnici</strong>: indispensabili, non richiedono consenso.
          </li>
          <li>
            <strong>Analitici</strong>: per capire come viene usato il sito, in
            forma anonimizzata.
          </li>
          <li>
            <strong>Pubblicitari</strong>: gestiti dai nostri partner (es.
            network di advertising) per mostrare annunci.
          </li>
        </ul>
        <h2 className="font-display text-2xl">Gestione</h2>
        <p>
          Puoi gestire o disabilitare i cookie dalle impostazioni del tuo
          browser. La disattivazione di alcuni cookie può limitare alcune
          funzionalità.
        </p>
        <p className="text-sm text-muted">
          Per domande:{" "}
          <a href={`mailto:${SITE.email}`} className="text-rise underline">
            {SITE.email}
          </a>
          .
        </p>
      </article>
    </Container>
  );
}
