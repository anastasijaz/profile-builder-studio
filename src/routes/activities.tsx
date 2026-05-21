import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal, MapPin, User, Users, Heart, MessageCircle } from "lucide-react";
import actRun from "@/assets/act-run.jpg";
import actSquash from "@/assets/act-squash.jpg";
import actPilates from "@/assets/act-pilates.jpg";
import actReform from "@/assets/act-reform.jpg";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPage,
  head: () => ({
    meta: [
      { title: "Activities — Crush" },
      { name: "description", content: "Discover shared activities to book together." },
    ],
  }),
});

type Activity = {
  image: string;
  gym: string;
  title: string;
  description: string;
  location: string;
  price: string;
  info: string;
};

const activities: Activity[] = [
  {
    image: actRun,
    gym: "Schlossgarten",
    title: "Run Club Erlangen",
    description: "We go run a 7k every Saturday and go for a coffee/brunch.",
    location: "Schlossgarten",
    price: "10€",
    info: "Free for members",
  },
  {
    image: actSquash,
    gym: "Sportland",
    title: "Squash Club",
    description:
      "Singles meet up Thursdays and play squash together. Welcome for beginners and pros.",
    location: "Sportland",
    price: "12€",
    info: "For all levels",
  },
  {
    image: actPilates,
    gym: "McFit",
    title: "Pilates",
    description: "Pilates class open to everyone!",
    location: "McFit",
    price: "10€",
    info: "Free for McFit Members",
  },
  {
    image: actReform,
    gym: "John Reed",
    title: "Reform Pilates",
    description: "Pilates class open to everyone!",
    location: "John Reed",
    price: "10€",
    info: "Free for JR Members",
  },
];

function ActivityCard({ a }: { a: Activity }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-md">
      <div className="relative">
        <img
          src={a.image}
          alt={a.title}
          loading="lazy"
          width={768}
          height={512}
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {a.gym}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">{a.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs font-light text-foreground/70">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{a.location}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-foreground/80">{a.description}</p>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{a.price}</span>
            <span className="text-[10px] font-light text-foreground/60">{a.info}</span>
          </div>
          <button className="ml-auto rounded-full bg-[#22172A] px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-95">
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivitiesPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFF7EF] font-montserrat text-[#22172A]">
      <div className="mx-auto w-full max-w-[420px] pb-32">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 pt-6">
          <h1 className="font-serif text-3xl font-semibold italic">Crush</h1>
          <button
            aria-label="Filters"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EFE6D9] bg-white shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </header>

        {/* Segmented tabs: Activities / Signed Up */}
        <div className="mx-5 mt-5 rounded-full bg-[#FFC387]/60 p-1">
          <div className="grid grid-cols-2 text-sm font-semibold">
            <button className="rounded-full bg-white py-2 text-[#22172A] shadow-sm">
              Activities
            </button>
            <button className="rounded-full py-2 text-[#22172A]/70">Signed Up</button>
          </div>
        </div>

        {/* Cards */}
        <section className="mt-6 space-y-5 px-5">
          {activities.map((a) => (
            <ActivityCard key={a.title} a={a} />
          ))}
        </section>
      </div>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#EFE6D9] bg-white/90 backdrop-blur">
        <ul className="mx-auto flex max-w-[420px] items-center justify-around px-4 py-3">
          {[
            { Icon: User, label: "Profile", to: "/" as const },
            { Icon: Users, label: "Activities", to: "/activities" as const, active: true },
            { Icon: Heart, label: "Liked you", to: "/" as const },
            { Icon: MessageCircle, label: "Chats", to: "/" as const },
          ].map(({ Icon, label, to, active }) => (
            <li key={label}>
              <Link to={to} className="flex flex-col items-center gap-1">
                <Icon
                  className={`h-5 w-5 ${active ? "text-[#22172A]" : "text-muted-foreground"}`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-[10px] ${active ? "font-semibold text-[#22172A]" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mx-auto mb-1 h-1 w-32 rounded-full bg-black/80" />
      </nav>
    </div>
  );
}
