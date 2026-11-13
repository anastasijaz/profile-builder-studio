import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isToday, isYesterday } from "date-fns";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { EmptyCard } from "@/components/ProfileFeed";
import { useMatches } from "@/lib/api/matches";
import { useSignedUrls } from "@/lib/api/photos";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/chats/")({
  component: ChatsPage,
  head: () => ({
    meta: [
      { title: "Chats — Melt" },
      { name: "description", content: "Your conversations on Melt." },
      { property: "og:title", content: "Chats — Melt" },
      { property: "og:description", content: "Your conversations on Melt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function when(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM");
}

function ChatsPage() {
  const { user } = useAuth();
  const matches = useMatches();
  const list = matches.data ?? [];
  const urls = useSignedUrls(list.map((m) => m.photo_path)).data ?? {};

  return (
    <PhoneShell>
      <PageHeader />
      <div className="px-5">
        <h1 className="font-serif text-3xl italic text-ink">Chats</h1>
        <p className="mt-1 text-sm text-ink/60">Keep the warmth going.</p>
      </div>

      {matches.isError ? (
        <div className="mt-5 px-5">
          <EmptyCard title="Couldn't load your chats.">
            <button onClick={() => matches.refetch()} className="font-semibold text-melt-orange">
              Try again
            </button>
          </EmptyCard>
        </div>
      ) : !matches.isPending && list.length === 0 ? (
        <div className="mt-5 px-5">
          <EmptyCard title="No matches yet.">
            When you and someone both melt, you can chat here.
          </EmptyCard>
        </div>
      ) : (
        <ul className="mt-4">
          {list.map((m) => (
            <li key={m.match_id}>
              <Link
                to="/chats/$matchId"
                params={{ matchId: m.match_id }}
                className="flex items-center gap-3 px-5 py-3 active:bg-ink/5"
              >
                {m.photo_path && urls[m.photo_path] ? (
                  <img
                    src={urls[m.photo_path]}
                    alt={m.display_name}
                    loading="lazy"
                    width={120}
                    height={120}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-full bg-melt-peach/40" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-ink">{m.display_name}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] text-ink/50">
                        {when(m.last_at ?? m.matched_at)}
                      </span>
                      {m.unread > 0 && (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-melt-orange px-1.5 text-[10px] font-semibold text-surface">
                          {m.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/60">
                    {m.last_body
                      ? `${m.last_sender === user?.id ? "You: " : ""}${m.last_body}`
                      : "New match — say hi 👋"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PhoneShell>
  );
}
