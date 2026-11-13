import { createFileRoute } from "@tanstack/react-router";
import { H2, LegalPage, P, Todo, UL } from "@/components/LegalPage";

// DRAFT — not legal advice. Fill in every highlighted [placeholder] and have
// it reviewed before opening Melt to the public.
export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy — Melt" }] }),
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="12 November 2026">
      <P>
        This policy explains what personal data Melt processes, why, and what rights you have under
        the EU General Data Protection Regulation (GDPR) and German data protection law.
      </P>

      <H2>1. Who is responsible</H2>
      <P>
        The controller is <Todo>full name or company</Todo>, <Todo>street and number</Todo>,{" "}
        <Todo>postcode and city</Todo>, Germany. Email: <Todo>privacy@your-domain.de</Todo>.
      </P>
      <P>
        <Todo>
          If you have appointed a data protection officer, name them here. Otherwise state that you
          are not required to appoint one.
        </Todo>
      </P>

      <H2>2. What we process</H2>
      <UL>
        <li>
          <strong>Account:</strong> your email address, sign-in times, and a record of your consent
          to these terms and this policy (date and version).
        </li>
        <li>
          <strong>Profile:</strong> first name, birthdate (others only see your age), city, bio,
          photos and the sports you choose.
        </li>
        <li>
          <strong>Approximate location (optional):</strong> if you allow it, your device position is
          rounded to about 5 km <em>on your device</em> before it is sent. Other users only see an
          approximate distance, never your location.
        </li>
        <li>
          <strong>Activity:</strong> who you like or pass, your matches, your messages and when you
          last read a chat.
        </li>
        <li>
          <strong>Safety:</strong> people you block, and reports you make or that are made about
          you, including a copy of a reported message.
        </li>
        <li>
          <strong>Technical data:</strong> our hosting providers process IP addresses and request
          logs to deliver and secure the service.
        </li>
      </UL>
      <P>
        Because Melt is a dating app, using it can reveal information about your sex life or sexual
        orientation. This is a special category of data under Art. 9 GDPR. We process it only with
        your explicit consent, which you give when you sign up.
      </P>

      <H2>3. Why we process it, and on what legal basis</H2>
      <UL>
        <li>
          To provide Melt: creating your account, showing your profile, suggesting people (ranked by
          shared sports and distance), likes, matches and chat. Legal basis: Art. 6(1)(b) GDPR
          (contract), and Art. 9(2)(a) GDPR (explicit consent) for the special-category data above.
        </li>
        <li>
          Approximate location for distances: Art. 6(1)(a) GDPR (consent). You can remove it at any
          time in <em>Edit profile</em>.
        </li>
        <li>
          Safety and moderation (blocks, reports, preventing misuse, enforcing the 18+ rule): Art.
          6(1)(f) GDPR (our legitimate interest, and yours, in a safe service).
        </li>
        <li>Sign-in emails: Art. 6(1)(b) GDPR.</li>
      </UL>
      <P>
        We don't sell your data, show ads or use tracking or analytics tools. We don't make
        decisions about you that have legal or similarly significant effects based solely on
        automated processing. The ordering of profiles in Discover is a simple ranking by shared
        sports and distance.
      </P>

      <H2>4. Who receives your data</H2>
      <P>
        Other Melt users see your profile (name, age, city, bio, photos, sports, approximate
        distance). Only your matches can message you. We use these processors under data processing
        agreements (Art. 28 GDPR):
      </P>
      <UL>
        <li>
          <strong>Supabase Inc.</strong> (database, sign-in, photo storage, real-time chat). Data is
          stored in the EU (Frankfurt, Germany). Supabase is a US company; any transfer outside the
          EU is covered by the EU Standard Contractual Clauses.
        </li>
        <li>
          <strong>
            <Todo>Cloudflare, Inc. / your hosting provider</Todo>
          </strong>{" "}
          (hosting the app).{" "}
          <Todo>Describe transfer safeguard, e.g. EU–US Data Privacy Framework</Todo>.
        </li>
        <li>
          <strong>
            <Todo>Email provider for sign-in links</Todo>
          </strong>
          .
        </li>
        <li>
          <strong>Google Fonts</strong> (Google Ireland Ltd.): the app currently loads fonts from
          Google's servers, which sends your IP address to Google.{" "}
          <Todo>Remove this item once fonts are self-hosted (recommended)</Todo>.
        </li>
      </UL>

      <H2>5. How long we keep it</H2>
      <UL>
        <li>
          Your account data is kept until you delete your account. Deletion in{" "}
          <em>Settings → Delete account</em> immediately and permanently removes your profile,
          photos, location, likes, matches and messages.
        </li>
        <li>
          Reports are kept for up to <Todo>12 months</Todo> after they are closed, without the
          reporter's identity if their account is deleted, so we can deal with repeat abuse.
        </li>
        <li>
          Backups and hosting logs are deleted on the providers' schedules (
          <Todo>e.g. up to 7 days for backups</Todo>).
        </li>
      </UL>

      <H2>6. Data stored on your device</H2>
      <P>
        Melt stores your sign-in session in your browser's local storage. This is strictly necessary
        to keep you signed in (§ 25(2) TDDDG), so we don't ask for separate consent. We don't use
        tracking cookies.
      </P>

      <H2>7. Your rights</H2>
      <P>You have the right to:</P>
      <UL>
        <li>
          access your data and receive a copy (Art. 15, 20). Use{" "}
          <em>Settings → Download my data</em>;
        </li>
        <li>
          correct it (Art. 16). Use <em>Edit profile</em>, or contact us to correct your birthdate;
        </li>
        <li>
          have it deleted (Art. 17). Use <em>Settings → Delete account</em>;
        </li>
        <li>
          restrict processing (Art. 18) and object to processing based on legitimate interests (Art.
          21);
        </li>
        <li>
          withdraw your consent at any time, with effect for the future (Art. 7(3)), by removing
          your location or deleting your account.
        </li>
      </UL>
      <P>
        To exercise any right, email <Todo>privacy@your-domain.de</Todo>. You can also complain to a
        data protection supervisory authority, for example the authority responsible for us:{" "}
        <Todo>
          e.g. Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach
        </Todo>
        .
      </P>

      <H2>8. Age</H2>
      <P>Melt is only for people aged 18 and over. We delete accounts we find belong to minors.</P>

      <H2>9. Changes</H2>
      <P>
        If we change this policy in a way that affects you, we'll tell you in the app and, where
        required, ask for your consent again.
      </P>
    </LegalPage>
  );
}
