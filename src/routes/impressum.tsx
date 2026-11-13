import { createFileRoute } from "@tanstack/react-router";
import { H2, LegalPage, P, Todo } from "@/components/LegalPage";

// MOCK — replace every highlighted [placeholder] with real details before launch.
export const Route = createFileRoute("/impressum")({
  component: ImpressumPage,
  head: () => ({ meta: [{ title: "Impressum — Melt" }] }),
});

function ImpressumPage() {
  return (
    <LegalPage title="Impressum" updated="13 November 2026">
      <H2>Angaben gemäß § 5 DDG</H2>
      <P>
        <Todo>Max Mustermann</Todo>
        <br />
        <Todo>Musterstraße 1</Todo>
        <br />
        <Todo>91052 Erlangen</Todo>
        <br />
        Deutschland
      </P>

      <H2>Kontakt</H2>
      <P>
        E-Mail: <Todo>hello@melt.example</Todo>
        <br />
        Telefon: <Todo>+49 000 0000000</Todo>
      </P>

      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <P>
        <Todo>Max Mustermann</Todo>, Anschrift wie oben
      </P>

      <H2>Verbraucherstreitbeilegung</H2>
      <P>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </P>
    </LegalPage>
  );
}
