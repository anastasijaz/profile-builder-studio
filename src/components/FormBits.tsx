import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Form primitives in the same style as the "Host an activity" form. */
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-melt-orange">
          {error}
        </span>
      )}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-11 w-full rounded-full border border-ink/10 bg-surface px-4 text-sm outline-none focus:border-melt-orange",
        className,
      )}
    />
  );
}

export function TextArea({
  value,
  onChange,
  ...rest
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-melt-orange"
    />
  );
}

/** Large tap-target checkbox row used for consent. */
export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-melt-orange",
          checked ? "border-melt-orange bg-melt-orange text-surface" : "border-ink/20 bg-surface",
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-12 w-full rounded-full bg-melt-orange text-base font-semibold text-surface shadow transition-transform disabled:opacity-50 active:scale-[0.98]",
        className,
      )}
    />
  );
}
