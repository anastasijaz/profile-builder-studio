import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

/** Shared layout for the privacy policy and terms. Readable when signed out. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  return (
    <div className="min-h-[100dvh] bg-page text-ink">
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Link
          to={status === "signed-in" ? "/profile" : "/welcome"}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl italic">{title}</h1>
      </header>
      <article className="legal mx-auto max-w-[640px] px-5 py-6 pb-20 text-sm leading-relaxed text-ink/85">
        <p className="text-xs text-ink/50">Last updated: {updated}</p>
        {children}
      </article>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 font-serif text-2xl text-ink">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-5">{children}</ul>;
}

/** Highlights text the operator must fill in before launch. */
export function Todo({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-melt-peach/60 px-1 text-ink">[{children}]</mark>;
}
