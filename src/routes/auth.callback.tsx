import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MeltWordmark } from "@/components/MeltWordmark";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
  head: () => ({ meta: [{ title: "Signing in — Melt" }] }),
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorDescription = params.get("error_description");

    (async () => {
      if (errorDescription) {
        setError(errorDescription);
        return;
      }
      const supabase = getSupabase();
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(
            "This sign-in link has expired or was opened in a different browser. Request a new one from the same device.",
          );
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("We couldn't sign you in. Please request a new link.");
        return;
      }
      // AuthGate takes it from here (onboarding or discover).
      navigate({ to: "/discover", replace: true });
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-page px-6 text-center">
      <MeltWordmark className="text-5xl" />
      {error ? (
        <>
          <p className="max-w-xs text-sm text-ink/70">{error}</p>
          <Link to="/welcome" className="text-sm font-semibold text-melt-orange">
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="text-sm text-ink/60">Signing you in…</p>
      )}
    </div>
  );
}
