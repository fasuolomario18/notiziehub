import { Container, Breadcrumbs } from "@/components/ui";
import { RemovalForm } from "@/components/RemovalForm";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Segnala / Richiedi rimozione",
  description:
    "Sei un creator e vuoi che la tua pagina venga rimossa? Inviaci la richiesta: procediamo rapidamente.",
  alternates: { canonical: "/rimozione" },
};

export default function Page() {
  return (
    <Container className="max-w-2xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Richiesta rimozione", path: "/rimozione" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">
        Segnala / Richiedi rimozione
      </h1>
      <p className="mt-3 text-muted">
        notiziehub pubblica solo dati pubblici e aggregati. Se sei la persona
        interessata (o un genitore/tutore nel caso di un minore) e vuoi che una
        pagina venga rimossa, compila il modulo. Procediamo{" "}
        <strong>rapidamente</strong>. In alternativa scrivi a{" "}
        <a href={`mailto:${SITE.email}`} className="text-rise underline">
          {SITE.email}
        </a>
        .
      </p>
      <div className="mt-6">
        <RemovalForm />
      </div>
    </Container>
  );
}
