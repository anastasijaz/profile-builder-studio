import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { TopToggle } from "@/components/TopToggle";
import { SafetyMenu } from "@/components/SafetyMenu";
import { MatchMeltOverlay } from "@/components/MatchMeltOverlay";
import { EmptyCard, ProfileFeed } from "@/components/ProfileFeed";
import { useDiscover, useSwipe } from "@/lib/api/discover";
import { useInterests } from "@/lib/api/interests";
import { useMyFullProfile, errorMessage } from "@/lib/api/profiles";
import { useSignedUrls } from "@/lib/api/photos";
import type { ProfileCard } from "@/lib/api/types";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
  head: () => ({
    meta: [
      { title: "Discover — Melt" },
      { name: "description", content: "Meet sport enthusiasts near you on Melt." },
      { property: "og:title", content: "Discover — Melt" },
      { property: "og:description", content: "Sweat together, then maybe melt together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function DiscoverPage() {
  const discover = useDiscover();
  const interests = useInterests();
  const me = useMyFullProfile();
  const swipe = useSwipe();
  // People swiped in this session are hidden right away, before the next refetch.
  const [swiped, setSwiped] = useState<Set<string>>(new Set());
  const [match, setMatch] = useState<{ id: string; person: ProfileCard } | null>(null);

  const queue = (discover.data ?? []).filter((p) => !swiped.has(p.id));
  const person = queue[0];

  const myPhoto = me.data?.photos[0]?.storage_path;
  const urls = useSignedUrls([myPhoto, match?.person.photoPaths[0]]).data ?? {};

  const act = (kind: "like" | "pass", promptId?: string) => {
    if (!person) return;
    swipe.mutate(
      { target: person.id, kind, promptId },
      {
        onSuccess: (matchId) => {
          setSwiped((s) => new Set(s).add(person.id));
          if (matchId) setMatch({ id: matchId, person });
          if (queue.length <= 3) discover.refetch();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <PhoneShell>
      <PageHeader />
      <div className="sticky top-0 z-10 bg-page/95 px-5 pb-3 pt-1 backdrop-blur">
        <TopToggle />
      </div>

      {person && (
        <p className="px-5 pb-3 pt-1 text-center text-xs text-ink/60">
          {queue.length === 1 ? "Last one for now" : `${queue.length - 1} more nearby`}
        </p>
      )}

      <section className="px-5">
        {discover.isPending || interests.isPending ? (
          <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-melt-peach/30" />
        ) : discover.isError ? (
          <EmptyCard title="Couldn't load profiles.">
            <button onClick={() => discover.refetch()} className="font-semibold text-melt-orange">
              Try again
            </button>
          </EmptyCard>
        ) : !person ? (
          <EmptyCard title="You've seen everyone for now.">
            <p>New people join every day. Check back soon, or add more sports to your profile.</p>
            <Link to="/profile/edit" className="mt-3 inline-block font-semibold text-melt-orange">
              Edit my sports
            </Link>
          </EmptyCard>
        ) : (
          <ProfileFeed
            key={person.id}
            card={person}
            interests={interests.data!.byId}
            busy={swipe.isPending}
            onPass={() => act("pass")}
            onLike={(promptId) => act("like", promptId)}
            topRight={
              <SafetyMenu
                targetId={person.id}
                targetName={person.name}
                onBlocked={() => setSwiped((s) => new Set(s).add(person.id))}
              />
            }
          />
        )}
      </section>

      {match && (
        <MatchMeltOverlay
          youPhoto={myPhoto ? urls[myPhoto] : undefined}
          themPhoto={urls[match.person.photoPaths[0]]}
          themName={match.person.name}
          matchId={match.id}
          onClose={() => setMatch(null)}
        />
      )}
    </PhoneShell>
  );
}
