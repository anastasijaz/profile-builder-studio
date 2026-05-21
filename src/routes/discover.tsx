import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Trophy,
  CheckCircle2,
  Heart,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { TopToggle } from "@/components/TopToggle";
import { MatchMeltOverlay } from "@/components/MatchMeltOverlay";
import { PEOPLE, type Person, type Prompt } from "@/data/people";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
  head: () => ({
    meta: [
      { title: "Discover — Melt" },
      { name: "description", content: "Meet sport enthusiasts near you on Melt." },
      { property: "og:title", content: "Discover — Melt" },
      { property: "og:description", content: "Sweat together, then maybe melt together." },
    ],
  }),
});

const iconMap = {
  work: Briefcase,
  school: GraduationCap,
  gym: Dumbbell,
  club: Trophy,
} as const;

function Chip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-ink/5 bg-surface px-3 py-2 shadow-sm">
      <span className="text-xs leading-none">{emoji}</span>
      <span className="text-[11px] font-light text-ink">{label}</span>
    </div>
  );
}

function MeltButton({
  active,
  onClick,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90",
        active
          ? "border-melt-orange bg-melt-orange text-surface shadow-[0_8px_20px_-6px_rgba(255,143,31,0.6)]"
          : "border-ink/10 bg-surface text-ink/60 hover:text-melt-orange",
      )}
    >
      <Heart className="h-5 w-5" fill={active ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}

function PromptCard({
  prompt,
  liked,
  onToggle,
}: {
  prompt: Prompt;
  liked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-3xl bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-melt-orange">
            {prompt.question}
          </p>
          <p className="mt-2 font-serif text-2xl leading-snug text-ink">{prompt.answer}</p>
        </div>
        <MeltButton
          active={liked}
          onClick={onToggle}
          ariaLabel={liked ? "Unmelt this prompt" : "Melt on this prompt"}
        />
      </div>
    </div>
  );
}

function ProfileFeed({ person, onMatch }: { person: Person; onMatch: () => void }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [passed, setPassed] = useState(false);

  if (passed) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center shadow-card">
        <p className="font-serif text-2xl text-ink">No worries.</p>
        <p className="mt-2 text-sm text-ink/60">Next profile coming up.</p>
      </div>
    );
  }

  const blocks: React.ReactNode[] = [];

  // Hero
  blocks.push(
    <div key="hero" className="relative overflow-hidden rounded-3xl bg-surface shadow-card">
      <img
        src={person.photos[0]}
        alt={person.name}
        width={704}
        height={832}
        className="aspect-[3/4] w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/70 to-transparent" />
      <div className="absolute bottom-4 left-5 right-5 text-surface">
        <p className="font-serif text-3xl leading-none">
          {person.name}, {person.age}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs opacity-90">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{person.location} · {person.distanceKm} km away</span>
        </div>
      </div>
    </div>,
  );

  // Shared activities
  blocks.push(
    <div key="activities" className="rounded-3xl bg-surface p-5 shadow-card">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
        Activities you have in common
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {person.sharedActivities.map((a) => (
          <Chip key={a.label} {...a} />
        ))}
      </div>
    </div>,
  );

  // Interleave prompts with photos
  person.prompts.forEach((p, i) => {
    blocks.push(
      <PromptCard
        key={`p-${i}`}
        prompt={p}
        liked={!!liked[i]}
        onToggle={() => setLiked((s) => ({ ...s, [i]: !s[i] }))}
      />,
    );
    if (person.photos[i + 1]) {
      blocks.push(
        <div key={`ph-${i}`} className="overflow-hidden rounded-3xl bg-surface shadow-card">
          <img
            src={person.photos[i + 1]}
            alt={`${person.name} photo ${i + 2}`}
            loading="lazy"
            width={704}
            height={832}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>,
      );
    }
  });

  // Basic info
  blocks.push(
    <div key="info" className="rounded-3xl bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold text-ink/70">Basic info</p>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      <ul className="mt-4 space-y-3">
        {person.basicInfo.map((b) => {
          const Icon = iconMap[b.icon];
          return (
            <li key={b.label} className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="text-sm">{b.label}</span>
              {b.verified && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-melt-mint" strokeWidth={2} />
              )}
            </li>
          );
        })}
      </ul>
    </div>,
  );

  return (
    <div className="space-y-4">
      {blocks}
      <div className="flex items-center justify-center gap-5 pt-2">
        <button
          onClick={() => setPassed(true)}
          aria-label="Pass"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink/60 shadow-card active:scale-90"
        >
          <X className="h-6 w-6" strokeWidth={2} />
        </button>
        <button
          onClick={() => setLiked((s) => ({ ...s, hero: true }))}
          aria-label="Super melt"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-melt-orange text-surface shadow-[0_10px_24px_-6px_rgba(255,143,31,0.65)] active:scale-90"
        >
          <Heart className="h-7 w-7" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function DiscoverPage() {
  const [idx, setIdx] = useState(0);
  const person = useMemo(() => PEOPLE[idx % PEOPLE.length], [idx]);

  return (
    <PhoneShell>
      <PageHeader />
      <div className="sticky top-0 z-10 bg-page/95 px-5 pb-3 pt-1 backdrop-blur">
        <TopToggle />
      </div>

      <div className="flex items-center justify-between px-5 pb-3 pt-1 text-xs text-ink/60">
        <button
          onClick={() => setIdx((i) => (i - 1 + PEOPLE.length) % PEOPLE.length)}
          className="flex items-center gap-1 rounded-full px-2 py-1 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span>
          {idx + 1} of {PEOPLE.length}
        </span>
        <button
          onClick={() => setIdx((i) => (i + 1) % PEOPLE.length)}
          className="flex items-center gap-1 rounded-full px-2 py-1 active:scale-95"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <section className="px-5">
        <ProfileFeed key={person.id} person={person} />
      </section>
    </PhoneShell>
  );
}
