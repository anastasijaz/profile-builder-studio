import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Trophy,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import tom1 from "@/assets/tom-1.jpg";
import tom2 from "@/assets/tom-2.jpg";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Your profile — Melt" },
      { name: "description", content: "Manage your Melt profile and prompts." },
      { property: "og:title", content: "Your profile — Melt" },
      { property: "og:description", content: "Manage your Melt profile and prompts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const basicInfo = [
  { Icon: Briefcase, label: "Marketing at Puma" },
  { Icon: GraduationCap, label: "Friedrich Alexander Universität" },
  { Icon: Dumbbell, label: "McFit", verified: true },
  { Icon: Trophy, label: "Run Club Erlangen", verified: true },
];

const sports = ["Surfing", "Running", "Gym", "Skiing", "Hyrox"];

function ProfilePage() {
  return (
    <PhoneShell>
      <PageHeader
        right={
          <button
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface shadow-sm active:scale-95"
          >
            <Settings className="h-4 w-4" />
          </button>
        }
      />

      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-surface shadow-card">
          <img
            src={tom1}
            alt="Your profile photo"
            width={704}
            height={864}
            className="aspect-[3/4] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute bottom-4 left-5 text-surface">
            <p className="font-serif text-3xl leading-none">Tom, 33</p>
            <p className="mt-1 text-xs opacity-90">Erlangen, Germany</p>
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            Your sports
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sports.map((s) => (
              <span
                key={s}
                className="rounded-full bg-melt-peach/60 px-3 py-1.5 text-xs font-medium text-ink"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-3xl bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-ink/70">Basic info</p>
            <div className="h-px flex-1 bg-ink/10" />
          </div>
          <ul className="mt-4 space-y-3">
            {basicInfo.map(({ Icon, label, verified }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{label}</span>
                {verified && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-melt-mint" strokeWidth={2} />
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-3xl bg-surface p-6 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-melt-orange">
            My simple pleasures
          </p>
          <p className="mt-3 font-serif text-xl leading-snug">
            Early morning runs along the river, an espresso at my favourite café, and a
            sunset surf session to round off the day.
          </p>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
          <img
            src={tom2}
            alt="You surfing at sunset"
            loading="lazy"
            width={704}
            height={832}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
      </section>
    </PhoneShell>
  );
}
