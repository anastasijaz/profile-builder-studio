import { createFileRoute } from "@tanstack/react-router";
import { MeltWordmark } from "@/components/MeltWordmark";
import { signOut } from "@/lib/auth";

// Placeholder: the real onboarding flow lands in the next commit.
export const Route = createFileRoute("/onboarding")({
  component: () => (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-page px-6 text-center">
      <MeltWordmark className="text-5xl" />
      <p className="text-sm text-ink/70">You're signed in. Onboarding is coming next.</p>
      <button onClick={() => signOut()} className="text-sm font-semibold text-melt-orange">
        Sign out
      </button>
    </div>
  ),
});
