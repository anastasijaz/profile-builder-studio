import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { MeltWordmark } from "@/components/MeltWordmark";
import { CheckRow, Field, PrimaryButton, TextInput } from "@/components/FormBits";
import { getSupabase, siteUrl } from "@/lib/supabase";
import { buildConsent } from "@/lib/consent";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
  head: () => ({
    meta: [
      { title: "Welcome — Melt" },
      { name: "description", content: "Sign in to Melt with a magic link." },
    ],
  }),
});

const emailSchema = z.string().trim().email("Enter a valid email address.");

function WelcomePage() {
  const [email, setEmail] = useState("");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  const canSubmit = adult && terms && privacy && email.trim().length > 0 && !sending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!adult || !terms || !privacy) return;
    setError(undefined);
    setSending(true);
    const { error } = await getSupabase().auth.signInWithOtp({
      email: parsed.data,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback`,
        shouldCreateUser: true,
        // Stored on the auth user at signup; the database copies it into the profile.
        data: { consent: buildConsent() },
      },
    });
    setSending(false);
    if (error) {
      setError(
        error.status === 429
          ? "Too many sign-in emails. Please wait a few minutes and try again."
          : error.message,
      );
      return;
    }
    setSentTo(parsed.data);
  };

  return (
    <div
      className="min-h-[100dvh] bg-page text-ink"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-6 pb-10 pt-16">
        <MeltWordmark className="text-6xl" />
        <p className="mt-3 font-serif text-2xl leading-snug text-ink">
          Sweat together, then maybe melt together.
        </p>
        <p className="mt-2 text-sm text-ink/60">Meet people near you who love the same sports.</p>

        {sentTo ? (
          <div className="mt-10 rounded-3xl bg-surface p-6 shadow-card">
            <MailCheck className="h-8 w-8 text-melt-orange" />
            <p className="mt-3 font-serif text-2xl">Check your inbox</p>
            <p className="mt-2 text-sm text-ink/70">
              We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to
              continue.
            </p>
            <button
              onClick={() => setSentTo(undefined)}
              className="mt-4 text-sm font-semibold text-melt-orange"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-3xl bg-surface p-6 shadow-card"
          >
            <Field label="Email" error={error}>
              <TextInput
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                className="bg-page"
              />
            </Field>

            <div className="space-y-1">
              <CheckRow checked={adult} onChange={setAdult}>
                I'm 18 or older.
              </CheckRow>
              <CheckRow checked={terms} onChange={setTerms}>
                I accept the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-melt-orange underline"
                >
                  Terms of Use
                </a>
                .
              </CheckRow>
              <CheckRow checked={privacy} onChange={setPrivacy}>
                I've read the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-melt-orange underline"
                >
                  Privacy Policy
                </a>{" "}
                and explicitly consent to Melt processing my profile data to show me matches,
                including data that may reveal my sex life or sexual orientation (Art. 9 GDPR).
              </CheckRow>
            </div>

            <PrimaryButton type="submit" disabled={!canSubmit}>
              {sending ? "Sending…" : "Send magic link"}
            </PrimaryButton>
            <p className="text-center text-xs text-ink/50">
              No password needed. We'll email you a link.
            </p>
          </form>
        )}
        <nav className="mt-auto flex justify-center gap-4 pt-10 text-xs text-ink/50">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/impressum">Impressum</a>
        </nav>
      </div>
    </div>
  );
}
