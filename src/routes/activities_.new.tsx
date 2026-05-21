import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { z } from "zod";
import { addUserActivity } from "@/data/user-activities";
import { ACTIVITIES } from "@/data/activities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activities_/new")({
  component: NewActivityPage,
  head: () => ({
    meta: [
      { title: "Host an activity — Melt" },
      { name: "description", content: "Post your own sport meetup and find people to melt with." },
      { property: "og:title", content: "Host an activity — Melt" },
      { property: "og:description", content: "Post your own sport meetup on Melt." },
    ],
  }),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const COVERS = Array.from(new Set(ACTIVITIES.map((a) => a.image)));

const Schema = z.object({
  title: z.string().trim().min(2, "Give it a title").max(80),
  sport: z.string().trim().min(2, "What sport?").max(40),
  description: z.string().trim().min(10, "A little more detail").max(400),
  location: z.string().trim().min(2, "Where?").max(80),
  gym: z.string().trim().min(1, "Venue or area").max(60),
  day: z.enum(DAYS),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24h time like 18:30"),
  price: z
    .string()
    .trim()
    .min(1, "Try 'Free' or '10€'")
    .max(20),
  info: z.string().trim().max(60).optional().default(""),
});

type FieldErrors = Partial<Record<keyof z.input<typeof Schema>, string>>;

function NewActivityPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    sport: "",
    description: "",
    location: "",
    gym: "",
    day: "Sat" as (typeof DAYS)[number],
    time: "18:00",
    price: "",
    info: "",
  });
  const [cover, setCover] = useState<string>(COVERS[0]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FieldErrors;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      setSubmitting(false);
      return;
    }
    addUserActivity({ ...parsed.data, image: cover });
    navigate({ to: "/activities" });
  };

  return (
    <div className="min-h-[100dvh] bg-page">
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Link
          to="/activities"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl italic text-ink">Host an activity</h1>
      </header>

      <form onSubmit={onSubmit} className="mx-auto max-w-[480px] space-y-5 px-5 py-5 pb-28">
        <Field label="Cover">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COVERS.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => setCover(src)}
                className={cn(
                  "h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition active:scale-95",
                  cover === src ? "border-melt-orange" : "border-transparent",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Title" error={errors.title}>
          <Input
            value={form.title}
            onChange={(v) => set("title", v)}
            placeholder="Sunset Run Club"
            maxLength={80}
          />
        </Field>

        <Field label="Sport" error={errors.sport}>
          <Input
            value={form.sport}
            onChange={(v) => set("sport", v)}
            placeholder="Running"
            maxLength={40}
          />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What's the vibe? Pace? Who's it for?"
            maxLength={400}
            rows={4}
            className="w-full resize-none rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-melt-orange"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Venue" error={errors.gym}>
            <Input value={form.gym} onChange={(v) => set("gym", v)} placeholder="Schlossgarten" maxLength={60} />
          </Field>
          <Field label="Location" error={errors.location}>
            <Input value={form.location} onChange={(v) => set("location", v)} placeholder="Erlangen" maxLength={80} />
          </Field>
        </div>

        <Field label="Day" error={errors.day}>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => set("day", d)}
                className={cn(
                  "h-11 min-w-11 rounded-full border px-4 text-sm font-semibold",
                  form.day === d
                    ? "border-melt-orange bg-melt-orange text-surface"
                    : "border-ink/10 bg-surface",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Time" error={errors.time}>
            <Input
              type="time"
              value={form.time}
              onChange={(v) => set("time", v)}
            />
          </Field>
          <Field label="Price" error={errors.price}>
            <Input value={form.price} onChange={(v) => set("price", v)} placeholder="10€" maxLength={20} />
          </Field>
        </div>

        <Field label="Extra info (optional)" error={errors.info}>
          <Input
            value={form.info}
            onChange={(v) => set("info", v)}
            placeholder="Free for members"
            maxLength={60}
          />
        </Field>

        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/5 bg-surface/95 px-5 py-3 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <div className="mx-auto max-w-[480px]">
            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-full bg-melt-orange text-base font-semibold text-surface shadow disabled:opacity-50 active:scale-[0.98]"
            >
              Post activity
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-melt-orange">{error}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      {...rest}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-full border border-ink/10 bg-surface px-4 text-sm outline-none focus:border-melt-orange"
    />
  );
}
