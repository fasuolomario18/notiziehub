import { Container, Breadcrumbs } from "@/components/ui";
import { AddChannelForm } from "@/components/AddChannelForm";

export const metadata = {
  title: "Aggiungi un canale",
  description:
    "Sei un creator o conosci un canale da inserire? Aggiungilo a notizihub: dati pubblici, classifiche e crescita, in automatico.",
  alternates: { canonical: "/aggiungi" },
};

export default function Page() {
  return (
    <Container className="max-w-2xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Aggiungi un canale", path: "/aggiungi" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Aggiungi un canale</h1>
      <p className="mt-3 text-muted">
        Manca un creator? Aggiungilo tu. Incolla l&apos;handle (es.{" "}
        <code className="rounded bg-surface px-1">@nome</code>), il link del
        canale YouTube o il suo ID: lo aggiungiamo subito con i suoi dati
        pubblici e inizieremo a tracciarne la crescita.
      </p>
      <div className="mt-6">
        <AddChannelForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Solo dati pubblici e aggregati. Per richieste di rimozione vedi la pagina{" "}
        <a href="/rimozione" className="text-rise underline">
          rimozione
        </a>
        .
      </p>
    </Container>
  );
}
