import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Send, CalendarDays } from "lucide-react";
import { getMatch } from "@/data/chats";
import { ACTIVITIES } from "@/data/activities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chats/$matchId")({
  loader: ({ params }) => {
    const data = getMatch(params.matchId);
    if (!data) throw notFound();
    return data;
  },
  component: ChatThread,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.person.name} — Melt` : "Chat — Melt" },
      { name: "description", content: "Keep your conversation going on Melt." },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-[100dvh] items-center justify-center bg-page p-6 text-center">
      <div>
        <p className="font-serif text-2xl">Chat not found.</p>
        <Link to="/chats" className="mt-3 inline-block text-sm text-melt-orange">
          Back to chats
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="flex min-h-[100dvh] items-center justify-center bg-page p-6 text-center">
      <button onClick={reset} className="text-sm text-melt-orange">
        Try again
      </button>
    </div>
  ),
});

type LocalMsg = { id: string; from: "me" | "them"; text: string; activity?: string };

function ChatThread() {
  const { match, person } = Route.useLoaderData();
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<LocalMsg[]>([]);
  const [showActivities, setShowActivities] = useState(false);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setExtra((m) => [...m, { id: String(Date.now()), from: "me", text }]);
    setDraft("");
  };

  const suggestActivity = (id: string) => {
    const a = ACTIVITIES.find((x) => x.id === id);
    if (!a) return;
    setExtra((m) => [
      ...m,
      {
        id: String(Date.now()),
        from: "me",
        text: `Want to join ${a.title} at ${a.location}?`,
        activity: a.id,
      },
    ]);
    setShowActivities(false);
  };

  const allMessages: LocalMsg[] = [
    ...match.messages.map((m): LocalMsg => ({ id: m.id, from: m.from, text: m.text })),
    ...extra,
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-page">
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Link
          to="/chats"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <img
          src={person.photos[0]}
          alt={person.name}
          width={80}
          height={80}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold leading-none">{person.name}</p>
          <p className="mt-1 text-[11px] text-ink/60">{person.location}</p>
        </div>
      </header>

      {/* Messages */}
      <ol className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {allMessages.map((m) => (
          <li
            key={m.id}
            className={cn(
              "flex",
              m.from === "me" ? "justify-end" : "justify-start",
            )}
          >
            {m.activity ? (
              <div className="max-w-[80%] rounded-2xl border border-melt-orange/30 bg-melt-peach/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-melt-orange">
                  Activity invite
                </p>
                <p className="mt-1 text-sm">{m.text}</p>
              </div>
            ) : (
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  m.from === "me"
                    ? "rounded-br-md bg-melt-orange text-surface"
                    : "rounded-bl-md bg-surface text-ink",
                )}
              >
                {m.text}
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Activity suggester */}
      {showActivities && (
        <div className="border-t border-ink/5 bg-surface px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            Suggest an activity
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => suggestActivity(a.id)}
                className="shrink-0 rounded-2xl border border-ink/10 bg-page px-3 py-2 text-left text-xs active:scale-95"
              >
                <p className="font-semibold">{a.title}</p>
                <p className="text-ink/60">{a.day} · {a.time}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div
        className="sticky bottom-0 flex items-center gap-2 border-t border-ink/5 bg-surface px-3 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <button
          onClick={() => setShowActivities((s) => !s)}
          aria-label="Suggest activity"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 active:scale-95",
            showActivities ? "bg-melt-peach" : "bg-page",
          )}
        >
          <CalendarDays className="h-5 w-5" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say something warm…"
          className="h-11 flex-1 rounded-full border border-ink/10 bg-page px-4 text-sm outline-none focus:border-melt-orange"
        />
        <button
          onClick={send}
          aria-label="Send"
          disabled={!draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-melt-orange text-surface shadow disabled:opacity-50 active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
