import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Send, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { ACTIVITIES } from "@/data/activities";
import { markMatchRead, useMatch, useMessages, useSendMessage } from "@/lib/api/matches";
import { useSignedUrls } from "@/lib/api/photos";
import { errorMessage } from "@/lib/api/profiles";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chats/$matchId")({
  component: ChatThread,
  head: () => ({
    meta: [
      { title: "Chat — Melt" },
      { name: "description", content: "Keep your conversation going on Melt." },
    ],
  }),
});

const MAX_LEN = 2000;

function ChatThread() {
  const { matchId } = Route.useParams();
  const { user } = useAuth();
  const match = useMatch(matchId);
  const messages = useMessages(matchId);
  const send = useSendMessage(matchId);
  const [draft, setDraft] = useState("");
  const [showActivities, setShowActivities] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = match.data;
  const photoUrl = useSignedUrls([other?.photo_path]).data?.[other?.photo_path ?? ""];
  const list = messages.data ?? [];

  // Keep the newest message in view and mark the thread as read.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
    if (user && list.length) markMatchRead(matchId, user.id);
  }, [list.length, matchId, user]);

  const submit = (text: string) => {
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(body.slice(0, MAX_LEN), {
      onSuccess: () => setDraft(""),
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  if (!match.isPending && !other) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-page p-6 text-center">
        <div>
          <p className="font-serif text-2xl">Chat not found.</p>
          <p className="mt-1 text-sm text-ink/60">This match may have ended.</p>
          <Link to="/chats" className="mt-3 inline-block text-sm text-melt-orange">
            Back to chats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-page">
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
        {other && (
          <Link
            to="/people/$userId"
            params={{ userId: other.other_id }}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={other.display_name}
                width={80}
                height={80}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-melt-peach/40" />
            )}
            <p className="truncate font-semibold leading-none">{other.display_name}</p>
          </Link>
        )}
      </header>

      {/* Messages */}
      <ol className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-4">
        {messages.isPending && <li className="text-center text-xs text-ink/50">Loading…</li>}
        {!messages.isPending && list.length === 0 && other && (
          <li className="py-10 text-center">
            <p className="font-serif text-2xl text-ink">You melted with {other.display_name}.</p>
            <p className="mt-1 text-sm text-ink/60">Say hi, or suggest something to do together.</p>
          </li>
        )}
        {list.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm shadow-sm",
                  mine
                    ? "rounded-br-md bg-melt-orange text-surface"
                    : "rounded-bl-md bg-surface text-ink",
                )}
              >
                {m.body}
              </div>
            </li>
          );
        })}
        <div ref={bottomRef} />
      </ol>

      {/* Activity suggester (activities are a preview, so this sends plain text) */}
      {showActivities && (
        <div className="border-t border-ink/5 bg-surface px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            Suggest an activity
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  submit(`Want to join ${a.title} at ${a.location}? (${a.day} ${a.time})`);
                  setShowActivities(false);
                }}
                className="shrink-0 rounded-2xl border border-ink/10 bg-page px-3 py-2 text-left text-xs active:scale-95"
              >
                <p className="font-semibold">{a.title}</p>
                <p className="text-ink/60">
                  {a.day} · {a.time}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="flex items-center gap-2 border-t border-ink/5 bg-surface px-3 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <button
          type="button"
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
          maxLength={MAX_LEN}
          placeholder="Say something warm…"
          aria-label="Message"
          className="h-11 flex-1 rounded-full border border-ink/10 bg-page px-4 text-sm outline-none focus:border-melt-orange"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim() || send.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-melt-orange text-surface shadow disabled:opacity-50 active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
