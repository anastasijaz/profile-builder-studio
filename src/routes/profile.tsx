import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, LogOut, Pencil, Settings } from "lucide-react";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { Photo } from "@/components/ProfileFeed";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth";
import { ageFrom } from "@/lib/age";
import { useInterests } from "@/lib/api/interests";
import { useMyFullProfile } from "@/lib/api/profiles";
import { useSignedUrls } from "@/lib/api/photos";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Your profile — Melt" },
      { name: "description", content: "Manage your Melt profile." },
      { property: "og:title", content: "Your profile — Melt" },
      { property: "og:description", content: "Manage your Melt profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SettingsRow({
  icon,
  children,
  onClick,
  to,
  danger,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
}) {
  const cls = `flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm active:bg-ink/5 ${
    danger ? "text-red-700" : "text-ink"
  }`;
  const inner = (
    <>
      <span className="flex h-8 w-8 items-center justify-center">{icon}</span>
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-4 w-4 opacity-40" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function ProfilePage() {
  const profile = useMyFullProfile();
  const interests = useInterests();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const p = profile.data;
  const urls = useSignedUrls(p?.photos.map((ph) => ph.storage_path) ?? []).data ?? {};
  const [hero, ...rest] = p?.photos ?? [];

  return (
    <PhoneShell>
      <PageHeader
        right={
          <button
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface shadow-sm active:scale-95"
          >
            <Settings className="h-4 w-4" />
          </button>
        }
      />

      {!p ? (
        <section className="px-5">
          <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-melt-peach/30" />
        </section>
      ) : (
        <>
          <section className="px-5">
            <div className="relative overflow-hidden rounded-3xl bg-surface shadow-card">
              <Photo
                url={hero ? urls[hero.storage_path] : undefined}
                alt="Your profile photo"
                eager
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-4 left-5 text-surface">
                <p className="font-serif text-3xl leading-none">
                  {p.displayName}, {p.birthdate ? ageFrom(p.birthdate) : ""}
                </p>
                <p className="mt-1 text-xs opacity-90">{p.city}</p>
              </div>
              <Link
                to="/profile/edit"
                aria-label="Edit profile"
                className="absolute right-3 top-3 flex h-11 items-center gap-1.5 rounded-full bg-surface/90 px-4 text-xs font-semibold text-ink shadow active:scale-95"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>
          </section>

          <section className="mt-4 px-5">
            <div className="rounded-3xl bg-surface p-5 shadow-card">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Your sports
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.interestIds.map((id) => {
                  const i = interests.data?.byId.get(id);
                  return i ? (
                    <span
                      key={id}
                      className="rounded-full bg-melt-peach/60 px-3 py-1.5 text-xs font-medium text-ink"
                    >
                      {i.emoji} {i.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </section>

          <section className="mt-4 px-5">
            <div className="rounded-3xl bg-surface p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-melt-orange">
                About me
              </p>
              {p.bio ? (
                <p className="mt-3 whitespace-pre-line break-words font-serif text-xl leading-snug">
                  {p.bio}
                </p>
              ) : (
                <Link to="/profile/edit" className="mt-3 block text-sm text-ink/60">
                  Add a short bio so people know what you're about →
                </Link>
              )}
            </div>
          </section>

          {rest.map((ph) => (
            <section key={ph.id} className="mt-4 px-5">
              <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
                <Photo url={urls[ph.storage_path]} alt="Your photo" />
              </div>
            </section>
          ))}
        </>
      )}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-page">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl italic">Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-2 space-y-1 pb-[env(safe-area-inset-bottom)]">
            <SettingsRow icon={<Pencil className="h-4 w-4" />} to="/profile/edit">
              Edit profile
            </SettingsRow>
            <SettingsRow icon={<LogOut className="h-4 w-4" />} onClick={() => signOut()}>
              Sign out
            </SettingsRow>
          </div>
        </SheetContent>
      </Sheet>
    </PhoneShell>
  );
}
