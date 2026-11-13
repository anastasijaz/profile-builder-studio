import { Heart, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { distanceLabel } from "@/lib/geo";
import { chipInterests, type Interest, type ProfileCard } from "@/lib/api/types";
import { useSignedUrls } from "@/lib/api/photos";

function Chip({ emoji, label, highlight }: { emoji: string; label: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-2 shadow-sm",
        highlight ? "border-melt-orange/30 bg-melt-peach/40" : "border-ink/5 bg-surface",
      )}
    >
      <span className="text-xs leading-none">{emoji}</span>
      <span className="text-[11px] font-light text-ink">{label}</span>
    </div>
  );
}

export function Photo({
  url,
  alt,
  eager,
  className,
  missing,
}: {
  url?: string;
  alt: string;
  eager?: boolean;
  className?: string;
  /** No photo exists (vs. still loading): show the first letter of `alt`. */
  missing?: boolean;
}) {
  if (missing) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-melt-peach to-melt-orange/70",
          className,
        )}
      >
        <span className="font-serif text-8xl italic text-surface/90">{alt.charAt(0)}</span>
      </div>
    );
  }
  return url ? (
    <img
      src={url}
      alt={alt}
      loading={eager ? undefined : "lazy"}
      width={704}
      height={832}
      className={cn("aspect-[3/4] w-full object-cover", className)}
    />
  ) : (
    <div className={cn("aspect-[3/4] w-full animate-pulse bg-melt-peach/30", className)} />
  );
}

/**
 * A full, scrollable profile: hero, shared sports, bio, extra photos and the
 * pass / melt buttons. Same layout as the original Lovable discover feed.
 */
export function ProfileFeed({
  card,
  interests,
  onPass,
  onLike,
  busy,
  topRight,
}: {
  card: ProfileCard;
  interests: Map<number, Interest>;
  onPass?: () => void;
  onLike?: () => void;
  busy?: boolean;
  /** Slot over the hero photo, e.g. the safety menu. */
  topRight?: React.ReactNode;
}) {
  const urls = useSignedUrls(card.photoPaths).data ?? {};
  const chips = chipInterests(card, interests);
  const anyShared = chips.some((c) => c.shared);
  const distance = distanceLabel(card.distanceKm);
  const [hero, ...rest] = card.photoPaths;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-surface shadow-card">
        <Photo url={hero ? urls[hero] : undefined} alt={card.name} eager missing={!hero} />
        {topRight && <div className="absolute right-3 top-3">{topRight}</div>}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-surface">
          <p className="font-serif text-3xl leading-none">
            {card.name}, {card.age}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs opacity-90">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>
              {card.city}
              {distance ? ` · ${distance}` : ""}
            </span>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            {anyShared ? "Activities you have in common" : `${card.name}'s sports`}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <Chip key={c.id} emoji={c.emoji} label={c.label} highlight={c.shared} />
            ))}
          </div>
        </div>
      )}

      {card.bio && (
        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-melt-orange">
                About me
              </p>
              <p className="mt-2 whitespace-pre-line break-words font-serif text-2xl leading-snug text-ink">
                {card.bio}
              </p>
            </div>
            {onLike && (
              <button
                onClick={onLike}
                disabled={busy}
                aria-label={`Melt for ${card.name}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink/60 transition-all hover:text-melt-orange active:scale-90 disabled:opacity-50"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      )}

      {rest.map((path, i) => (
        <div key={path} className="overflow-hidden rounded-3xl bg-surface shadow-card">
          <Photo url={urls[path]} alt={`${card.name} photo ${i + 2}`} />
        </div>
      ))}

      {(onPass || onLike) && (
        <div className="flex items-center justify-center gap-5 pt-2">
          {onPass && (
            <button
              onClick={onPass}
              disabled={busy}
              aria-label="Pass"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink/60 shadow-card active:scale-90 disabled:opacity-50"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>
          )}
          {onLike && (
            <button
              onClick={onLike}
              disabled={busy}
              aria-label={`Melt for ${card.name}`}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-melt-orange text-surface shadow-[0_10px_24px_-6px_rgba(255,143,31,0.65)] active:scale-90 disabled:opacity-50"
            >
              <Heart className="h-7 w-7" fill="currentColor" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Centered empty / error state card in the app's style. */
export function EmptyCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-10 text-center shadow-card">
      <p className="font-serif text-2xl text-ink">{title}</p>
      {children && <div className="mt-2 text-sm text-ink/60">{children}</div>}
    </div>
  );
}
