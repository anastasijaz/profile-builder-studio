import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, SlidersHorizontal, Check, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { TopToggle } from "@/components/TopToggle";
import { ACTIVITIES, type Activity } from "@/data/activities";
import { useUserActivities } from "@/data/user-activities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPage,
  head: () => ({
    meta: [
      { title: "Activities — Melt" },
      { name: "description", content: "Book sport activities near you and meet your match in motion." },
      { property: "og:title", content: "Activities — Melt" },
      { property: "og:description", content: "Run, lift, climb, melt." },
    ],
  }),
});

function ActivityCard({
  a,
  signedUp,
  onToggle,
}: {
  a: Activity;
  signedUp: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl bg-surface shadow-card">
      <div className="relative">
        <img
          src={a.image}
          alt={a.title}
          loading="lazy"
          width={768}
          height={512}
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {a.gym}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-medium text-surface backdrop-blur">
          {a.day} · {a.time}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">{a.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs font-light text-ink/70">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{a.location}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink/80">{a.description}</p>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{a.price}</span>
            <span className="text-[10px] font-light text-ink/60">{a.info}</span>
          </div>
          <button
            onClick={onToggle}
            className={cn(
              "ml-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition active:scale-95",
              signedUp
                ? "bg-melt-mint text-ink"
                : "bg-ink text-surface",
            )}
          >
            {signedUp ? (
              <>
                <Check className="h-4 w-4" /> Signed up
              </>
            ) : (
              "Book"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivitiesPage() {
  const [tab, setTab] = useState<"all" | "signed">("all");
  const [signedUp, setSignedUp] = useState<Record<string, boolean>>({});
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const userActivities = useUserActivities();

  const all = useMemo(
    () => [...userActivities, ...ACTIVITIES],
    [userActivities],
  );

  const sports = useMemo(
    () => Array.from(new Set(all.map((a) => a.sport))),
    [all],
  );

  const list = useMemo(() => {
    return all.filter((a) => {
      if (tab === "signed" && !signedUp[a.id]) return false;
      if (sportFilter && a.sport !== sportFilter) return false;
      return true;
    });
  }, [all, tab, signedUp, sportFilter]);

  return (
    <PhoneShell>
      <PageHeader
        right={
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Filters"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface shadow-sm active:scale-95"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl bg-page">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl italic text-ink">
                  Filter activities
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-ink/60">Sport</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSportFilter(null)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      sportFilter === null
                        ? "border-melt-orange bg-melt-orange text-surface"
                        : "border-ink/10 bg-surface",
                    )}
                  >
                    All
                  </button>
                  {sports.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSportFilter(s)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm",
                        sportFilter === s
                          ? "border-melt-orange bg-melt-orange text-surface"
                          : "border-ink/10 bg-surface",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      <div className="sticky top-0 z-10 bg-page/95 px-5 pb-3 pt-1 backdrop-blur">
        <TopToggle />
      </div>

      <div className="mx-5 mt-3 grid grid-cols-2 rounded-full bg-ink/5 p-1 text-sm font-semibold">
        <button
          onClick={() => setTab("all")}
          className={cn(
            "rounded-full py-2 transition",
            tab === "all" ? "bg-surface text-ink shadow-sm" : "text-ink/60",
          )}
        >
          All
        </button>
        <button
          onClick={() => setTab("signed")}
          className={cn(
            "rounded-full py-2 transition",
            tab === "signed" ? "bg-melt-mint text-ink shadow-sm" : "text-ink/60",
          )}
        >
          Signed up
        </button>
      </div>

      <section className="mt-5 space-y-5 px-5">
        {list.length === 0 ? (
          <div className="rounded-3xl bg-surface p-10 text-center shadow-card">
            <p className="font-serif text-xl">Nothing here yet.</p>
            <p className="mt-2 text-sm text-ink/60">Book an activity to see it here.</p>
          </div>
        ) : (
          list.map((a) => (
            <ActivityCard
              key={a.id}
              a={a}
              signedUp={!!signedUp[a.id]}
              onToggle={() =>
                setSignedUp((s) => ({ ...s, [a.id]: !s[a.id] }))
              }
            />
          ))
        )}
      </section>
    </PhoneShell>
  );
}
