import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LegalPage, P, Todo, UL } from "@/components/LegalPage";

// DRAFT — not legal advice. Fill in every highlighted [placeholder] and have
// it reviewed before opening Melt to the public.
export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms of Use — Melt" }] }),
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="12 November 2026">
      <P>
        Melt is operated by <Todo>full name or company, address</Todo> ("we"). By creating an
        account you agree to these terms. Melt is currently free and in a test phase.
      </P>

      <H2>1. Who can use Melt</H2>
      <UL>
        <li>You must be at least 18 years old.</li>
        <li>You may only have one account, and it must represent you, a real person.</li>
        <li>You may not use Melt if we have previously removed you.</li>
      </UL>

      <H2>2. Your profile and content</H2>
      <UL>
        <li>Your information must be truthful. Photos must show you.</li>
        <li>
          You keep the rights to your content. You allow us to store it and show it to other users
          for as long as your account exists, so we can run Melt.
        </li>
        <li>Don't post content you don't have the rights to.</li>
      </UL>

      <H2>3. Be decent</H2>
      <P>You must not:</P>
      <UL>
        <li>harass, threaten, insult or discriminate against anyone;</li>
        <li>post nudity, sexual, violent, hateful or illegal content;</li>
        <li>impersonate someone, run fake profiles, scam or ask for money;</li>
        <li>advertise, sell or recruit, or send spam;</li>
        <li>contact or involve anyone under 18;</li>
        <li>scrape, automate or try to break Melt's security.</li>
      </UL>
      <P>
        Use <em>Report</em> and <em>Block</em> (in the ⋯ menu on every profile and chat) if someone
        breaks these rules. We review reports and may remove content, or suspend or delete accounts
        that break these terms, especially where there's a risk to others.
      </P>

      <H2>4. Meeting people safely</H2>
      <P>
        We don't run background checks and can't guarantee who other users are. Meet in public
        places, tell a friend where you're going, and don't share financial information. If you're
        in danger, call the police on 110.
      </P>

      <H2>5. Activities</H2>
      <P>
        The Activities section is a preview with sample data. Bookings shown there are not real.
      </P>

      <H2>6. Availability and liability</H2>
      <P>
        Melt is provided free of charge during the test phase, and may change, be interrupted or be
        discontinued. We are fully liable for intent and gross negligence, for injury to life, body
        or health, and under the Product Liability Act. For slight negligence we are only liable for
        breaches of essential obligations, limited to the typical, foreseeable damage. We are not
        responsible for the behaviour of other users, online or offline.
      </P>

      <H2>7. Ending your account</H2>
      <P>
        You can delete your account at any time in <em>Settings → Delete account</em>. We may end
        your account for a serious breach of these terms, or with reasonable notice if we shut Melt
        down.
      </P>

      <H2>8. Privacy</H2>
      <P>
        How we handle your data is described in the{" "}
        <Link to="/privacy" className="font-semibold text-melt-orange underline">
          Privacy Policy
        </Link>
        .
      </P>

      <H2>9. Changes and law</H2>
      <P>
        We'll tell you about material changes in the app before they take effect. German law
        applies; mandatory consumer protection rules of your country of residence remain unaffected.
        Contact: <Todo>support@your-domain.de</Todo>.
      </P>
    </LegalPage>
  );
}
