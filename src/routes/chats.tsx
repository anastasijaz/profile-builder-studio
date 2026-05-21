import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneShell, PageHeader } from "@/components/PhoneShell";
import { MATCHES } from "@/data/chats";
import { PEOPLE } from "@/data/people";

export const Route = createFileRoute("/chats")({
  component: ChatsPage,
  head: () => ({
    meta: [
      { title: "Chats — Melt" },
      { name: "description", content: "Your conversations on Melt." },
    ],
  }),
});

function ChatsPage() {
  return (
    <PhoneShell>
      <PageHeader />
      <div className="px-5">
        <h1 className="font-serif text-3xl italic text-ink">Chats</h1>
        <p className="mt-1 text-sm text-ink/60">Keep the warmth going.</p>
      </div>

      <ul className="mt-4">
        {MATCHES.map((m) => {
          const person = PEOPLE.find((p) => p.id === m.personId)!;
          return (
            <li key={m.id}>
              <Link
                to="/chats/$matchId"
                params={{ matchId: m.id }}
                className="flex items-center gap-3 px-5 py-3 active:bg-ink/5"
              >
                <img
                  src={person.photos[0]}
                  alt={person.name}
                  loading="lazy"
                  width={120}
                  height={120}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-ink">{person.name}</p>
                    {m.unread > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-melt-orange px-1.5 text-[10px] font-semibold text-surface">
                        {m.unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/60">{m.lastMessage}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </PhoneShell>
  );
}
