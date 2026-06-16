import { Container, Breadcrumbs } from "@/components/ui";

export const metadata = {
  title: "Come funziona notiziehub",
  description:
    "Da dove arrivano i dati, come li aggiorniamo e perché pubblichiamo solo fatti e numeri con la fonte sempre linkata.",
  alternates: { canonical: "/metodo" },
};

export default function Page() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Come funziona", path: "/metodo" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Come funziona</h1>
      <article className="mt-6 space-y-5 leading-relaxed text-paper/90">
        <p>
          <strong>notiziehub</strong> è un tabellone di dati sulla cultura
          giovane: creator, artisti, brani e trend. Non è un sito di gossip:
          pubblichiamo solo <strong>fatti e numeri</strong>, con la fonte
          ufficiale sempre linkata.
        </p>
        <h2 className="font-display text-2xl">Da dove arrivano i dati</h2>
        <p>
          Raccogliamo statistiche pubbliche dalle API ufficiali delle
          piattaforme (YouTube, Spotify, Twitch e altre) e da dataset aperti.
          Ogni entità riporta il link alla sua fonte: i numeri che vedi sono
          verificabili.
        </p>
        <h2 className="font-display text-2xl">Come li aggiorniamo</h2>
        <p>
          Un processo automatico aggiorna i dati a intervalli regolari e salva
          una <strong>versione datata</strong> di ogni metrica. È così che
          nascono i grafici di crescita e gli archivi storici delle classifiche.
        </p>
        <h2 className="font-display text-2xl">Cosa non facciamo</h2>
        <p>
          Niente accuse, niente ricostruzioni su comportamenti privati, niente
          copia di articoli altrui. Trattiamo anche i fenomeni più caldi (come i
          dissing) solo attraverso i dati e i sondaggi del pubblico.
        </p>
        <h2 className="font-display text-2xl">Rispetto delle persone</h2>
        <p>
          Usiamo solo dati pubblici e aggregati. Se sei un creator e vuoi che la
          tua pagina venga rimossa, puoi richiederlo dalla pagina{" "}
          <a href="/rimozione" className="text-rise underline">
            Segnala / Richiedi rimozione
          </a>
          : procediamo rapidamente.
        </p>
      </article>
    </Container>
  );
}
