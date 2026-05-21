import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, CalendarDays, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/discover", label: "Discover", Icon: Compass, match: "/discover" },
  { to: "/activities", label: "Activities", Icon: CalendarDays, match: "/activities" },
  { to: "/likes", label: "Likes", Icon: Heart, match: "/likes" },
  { to: "/chats", label: "Chats", Icon: MessageCircle, match: "/chats" },
  { to: "/profile", label: "Profile", Icon: User, match: "/profile" },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/5 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-[480px] items-stretch justify-around px-2 py-2">
        {items.map(({ to, label, Icon, match }) => {
          const active = location.pathname.startsWith(match);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                className="flex h-12 min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-2xl active:scale-95 transition-transform"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-melt-orange" : "text-ink/55",
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                  fill={active && (label === "Likes" || label === "Discover") ? "currentColor" : "none"}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    active ? "font-semibold text-ink" : "text-ink/55",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
