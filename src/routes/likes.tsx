import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { EmptyCard, Photo } from "@/components/ProfileFeed";
import { useLikesReceived } from "@/lib/api/discover";
import { useSignedUrls } from "@/lib/api/photos";

export const Route = createFileRoute("/likes")({
  component: LikesPage,
  head: () => ({
    meta: [
      { title: "Likes — Melt" },
      { name: "description", content: "People who melted for you." },
      { property: "og:title", content: "Likes — Melt" },
      { property: "og:description", content: "People who melted for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LikesPage() {
  const likes = useLikesReceived();
  const likers = likes.data ?? [];
  const urls = useSignedUrls(likers.map((p) => p.photoPaths[0])).data ?? {};

  return (
    <PhoneShell>
      <PageHeader />
      <div className="px-5">
        <h1 className="font-serif text-3xl italic text-ink">Melted for you</h1>
        <p className="mt-1 text-sm text-ink/60">
          {likes.isPending
            ? "Warming up…"
            : likers.length === 1
              ? "1 person is warming up to you."
              : `${likers.length} people are warming up to you.`}
        </p>
      </div>

      {likes.isError ? (
        <div className="mt-5 px-5">
          <EmptyCard title="Couldn't load your likes.">
            <button onClick={() => likes.refetch()} className="font-semibold text-melt-orange">
              Try again
            </button>
          </EmptyCard>
        </div>
      ) : !likes.isPending && likers.length === 0 ? (
        <div className="mt-5 px-5">
          <EmptyCard title="No likes yet.">
            When someone melts for you, they'll show up here.
          </EmptyCard>
        </div>
      ) : (
        <section className="mt-5 grid grid-cols-2 gap-3 px-5">
          {likers.map((p) => (
            <Link
              key={p.id}
              to="/people/$userId"
              params={{ userId: p.id }}
              className="relative overflow-hidden rounded-3xl bg-surface shadow-card active:scale-[0.98]"
            >
              <Photo url={urls[p.photoPaths[0]]} alt={p.name} missing={!p.photoPaths[0]} />
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-melt-orange text-surface shadow">
                <Heart className="h-4 w-4" fill="currentColor" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 text-surface">
                <p className="font-serif text-lg leading-none">
                  {p.name}, {p.age}
                </p>
                <p className="mt-1 text-[10px] opacity-90">
                  {p.likedPrompt ? (
                    <>
                      Melted on: <em className="not-italic">{p.likedPrompt}</em>
                    </>
                  ) : (
                    "Melted for you"
                  )}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </PhoneShell>
  );
}
