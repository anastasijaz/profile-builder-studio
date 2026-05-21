import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Trophy,
  CheckCircle2,
  SlidersHorizontal,
  User,
  Users,
  MessageCircle,
  Heart,
} from "lucide-react";
import tom1 from "@/assets/tom-1.jpg";
import tom2 from "@/assets/tom-2.jpg";

export const Route = createFileRoute("/")({
  component: ProfileCrush,
  head: () => ({
    meta: [
      { title: "Tom, 33 — Crush" },
      { name: "description", content: "Profile preview on Crush dating app." },
    ],
  }),
});

const activities = [
  { label: "Surfing", emoji: "🏄" },
  { label: "Running", emoji: "👟" },
  { label: "Gym", emoji: "🏋️" },
  { label: "Skiing", emoji: "🎿" },
  { label: "Hyrox", emoji: "⛓️" },
];

const basicInfo = [
  { Icon: Briefcase, label: "Marketing at Puma", verified: false },
  { Icon: GraduationCap, label: "Friedrich Alexander Universität", verified: false },
  { Icon: Dumbbell, label: "McFit", verified: true },
  { Icon: Trophy, label: "Run Club Erlangen", verified: true },
];

function Chip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#F1ECE5] bg-white px-3 py-1.5 shadow-sm">
      <span className="text-[11px] leading-none">{emoji}</span>
      <span className="font-montserrat text-[11px] font-light text-foreground">{label}</span>
    </div>
  );
}

function ProfileCrush() {
  return (
    <div className="min-h-screen w-full bg-[#FFF7EF] font-montserrat text-[#22172A]">
      {/* Phone-like frame, fluid on mobile, centered on larger screens */}
      <div className="mx-auto w-full max-w-[420px] pb-32">
        {/* Top status / app bar */}
        <header className="flex items-center justify-between px-6 pt-6">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            <span className="italic">Crush</span>
          </h1>
          <button
            aria-label="Filters"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EFE6D9] bg-white shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </header>

        {/* Hero card */}
        <section className="mt-6 px-5">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-md">
            <img
              src={tom1}
              alt="Tom, 33"
              width={704}
              height={864}
              className="aspect-[340/423] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 text-white">
              <p className="text-xl font-semibold">Tom, 33</p>
              <p className="text-xs font-light opacity-90">Erlangen, Germany</p>
            </div>
          </div>
        </section>

        {/* Activities in common */}
        <section className="mt-5 px-5">
          <div className="rounded-3xl bg-white p-5 shadow-md">
            <h2 className="text-[11px] font-semibold">Activities you have in common</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {activities.map((a) => (
                <Chip key={a.label} {...a} />
              ))}
            </div>
          </div>
        </section>

        {/* Bio / Basic info */}
        <section className="mt-5 px-5">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <p className="text-xs text-foreground">Basic Info</p>
              <div className="h-px flex-1 bg-black/10" />
            </div>
            <ul className="mt-4 space-y-3">
              {basicInfo.map(({ Icon, label, verified }) => (
                <li key={label} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-foreground" strokeWidth={1.5} />
                  <span className="text-xs">{label}</span>
                  {verified && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Prompt */}
        <section className="mt-5 px-5">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              My simple pleasures
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Early morning runs along the river, an espresso at my favourite café, and
              a sunset surf session to round off the day.
            </p>
          </div>
        </section>

        {/* Second photo */}
        <section className="mt-5 px-5">
          <div className="overflow-hidden rounded-3xl bg-white shadow-md">
            <img
              src={tom2}
              alt="Tom surfing at sunset"
              loading="lazy"
              width={704}
              height={832}
              className="aspect-[340/400] w-full object-cover"
            />
          </div>
        </section>

        {/* Like CTA */}
        <div className="mt-6 flex justify-center">
          <button
            aria-label="Like Tom"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22172A] text-white shadow-lg transition-transform active:scale-95"
          >
            <Heart className="h-6 w-6" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#EFE6D9] bg-white/90 backdrop-blur">
        <ul className="mx-auto flex max-w-[420px] items-center justify-around px-4 py-3">
          {[
            { Icon: User, label: "Profile" },
            { Icon: Users, label: "People" },
            { Icon: Heart, label: "Liked you", active: true },
            { Icon: MessageCircle, label: "Chats" },
          ].map(({ Icon, label, active }) => (
            <li key={label}>
              <button className="flex flex-col items-center gap-1">
                <Icon
                  className={`h-5 w-5 ${active ? "text-[#22172A]" : "text-muted-foreground"}`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-[10px] ${active ? "font-semibold text-[#22172A]" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mx-auto mb-1 h-1 w-32 rounded-full bg-black/80" />
      </nav>
    </div>
  );
}
