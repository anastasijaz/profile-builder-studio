import { cn } from "@/lib/utils";

export function MeltWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-serif italic text-3xl leading-none text-ink select-none",
        className,
      )}
    >
      melt
      <span className="text-melt-orange">.</span>
    </span>
  );
}
