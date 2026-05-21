import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

/**
 * App shell — full-bleed phone column on mobile, centered phone-in-frame on
 * larger screens. Reserves space for the bottom nav.
 */
export function PhoneShell({
  children,
  className,
  hideNav,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-page text-ink">
      <div
        className={cn(
          "mx-auto w-full max-w-[480px] min-h-[100dvh] bg-page",
          "sm:my-6 sm:min-h-0 sm:rounded-[36px] sm:overflow-hidden sm:shadow-[0_30px_80px_-30px_rgba(34,23,42,0.25)] sm:border sm:border-ink/5",
          className,
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className={cn("pb-28", hideNav && "pb-0")}>{children}</div>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export function PageHeader({
  title,
  right,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <div className="text-2xl font-serif italic text-ink">
        melt<span className="text-melt-orange">.</span>
      </div>
      <div className="flex items-center gap-2">
        {title ? (
          <span className="text-sm font-semibold text-ink/70">{title}</span>
        ) : null}
        {right}
      </div>
    </header>
  );
}
