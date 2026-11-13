import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { MatchMeltOverlay } from "@/components/MatchMeltOverlay";
import { EmptyCard, ProfileFeed } from "@/components/ProfileFeed";
import { useProfileCard, useSwipe } from "@/lib/api/discover";
import { useInterests } from "@/lib/api/interests";
import { errorMessage, useMyFullProfile } from "@/lib/api/profiles";
import { useSignedUrls } from "@/lib/api/photos";

export const Route = createFileRoute("/people/$userId")({
  component: PersonPage,
  head: () => ({ meta: [{ title: "Profile — Melt" }] }),
});

function PersonPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const card = useProfileCard(userId);
  const interests = useInterests();
  const me = useMyFullProfile();
  const swipe = useSwipe();
  const [matchId, setMatchId] = useState<string | null>(null);

  const myPhoto = me.data?.photos[0]?.storage_path;
  const urls = useSignedUrls([myPhoto, card.data?.photoPaths[0]]).data ?? {};

  const act = (kind: "like" | "pass") =>
    swipe.mutate(
      { target: userId, kind },
      {
        onSuccess: (mid) => {
          if (mid) setMatchId(mid);
          else navigate({ to: "/likes" });
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <div className="min-h-[100dvh] bg-page text-ink">
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Link
          to="/likes"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl italic">{card.data?.name ?? "Profile"}</h1>
      </header>

      <section className="mx-auto max-w-[480px] px-5 py-5 pb-16">
        {card.isPending || interests.isPending ? (
          <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-melt-peach/30" />
        ) : !card.data ? (
          <EmptyCard title="This profile isn't available.">
            It may have been deleted or hidden.
          </EmptyCard>
        ) : (
          <ProfileFeed
            card={card.data}
            interests={interests.data!.byId}
            busy={swipe.isPending}
            onPass={() => act("pass")}
            onLike={() => act("like")}
          />
        )}
      </section>

      {matchId && card.data && (
        <MatchMeltOverlay
          youPhoto={myPhoto ? urls[myPhoto] : undefined}
          themPhoto={urls[card.data.photoPaths[0]]}
          themName={card.data.name}
          matchId={matchId}
          onClose={() => navigate({ to: "/likes" })}
        />
      )}
    </div>
  );
}
