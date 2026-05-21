import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function TopToggle() {
  const { location } = useRouterState();
  const isActivities = location.pathname.startsWith("/activities");
  return (
    <div
      role="tablist"
      aria-label="Switch between people and activities"
      className="grid grid-cols-2 rounded-full bg-melt-peach/50 p-1 text-sm font-semibold"
    >
      <Link
        to="/discover"
        role="tab"
        aria-selected={!isActivities}
        className={cn(
          "rounded-full py-2 text-center transition-colors",
          !isActivities ? "bg-surface text-ink shadow-sm" : "text-ink/70",
        )}
      >
        People
      </Link>
      <Link
        to="/activities"
        role="tab"
        aria-selected={isActivities}
        className={cn(
          "rounded-full py-2 text-center transition-colors",
          isActivities ? "bg-surface text-ink shadow-sm" : "text-ink/70",
        )}
      >
        Activities
      </Link>
    </div>
  );
}
