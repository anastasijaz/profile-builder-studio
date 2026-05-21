import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { PEOPLE } from "@/data/people";

export const Route = createFileRoute("/likes")({
  component: LikesPage,
  head: () => ({
    meta: [
      { title: "Likes — Melt" },
      { name: "description", content: "People who melted for you." },
    ],
  }),
});

function LikesPage() {
  const likers = PEOPLE.slice(0, 4);
  return (
    <PhoneShell>
      <PageHeader />
      <div className="px-5">
        <h1 className="font-serif text-3xl italic text-ink">Melted for you</h1>
        <p className="mt-1 text-sm text-ink/60">
          {likers.length} people are warming up to you.
        </p>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        {likers.map((p, i) => (
          <article
            key={p.id}
            className="relative overflow-hidden rounded-3xl bg-surface shadow-card"
          >
            <img
              src={p.photos[0]}
              alt={p.name}
              loading="lazy"
              width={704}
              height={832}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-melt-orange text-surface shadow">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 text-surface">
              <p className="font-serif text-lg leading-none">
                {p.name}, {p.age}
              </p>
              <p className="mt-1 text-[10px] opacity-90">
                Melted on: <em className="not-italic">{p.prompts[i % p.prompts.length].question}</em>
              </p>
            </div>
          </article>
        ))}
      </section>
    </PhoneShell>
  );
}
