import { useRef, useState } from "react";
import { Camera, Loader2, LocateFixed, Plus, Star, Trash2 } from "lucide-react";
import { MAX_PROMPTS, PROMPT_ANSWER_MAX, PROMPT_QUESTIONS, type PromptDraft } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { getRoundedBrowserLocation } from "@/lib/geo";
import { useSignedUrls } from "@/lib/api/photos";
import type { Interest } from "@/lib/api/types";
import type { MyPhoto } from "@/lib/api/profiles";
import { MAX_PHOTOS } from "@/lib/profile-schema";

export function InterestPicker({
  interests,
  value,
  onChange,
  max = 10,
}: {
  interests: Interest[];
  value: number[];
  onChange: (v: number[]) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((i) => {
        const on = value.includes(i.id);
        return (
          <button
            type="button"
            key={i.id}
            aria-pressed={on}
            disabled={!on && value.length >= max}
            onClick={() => onChange(on ? value.filter((v) => v !== i.id) : [...value, i.id])}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition active:scale-95 disabled:opacity-40",
              on
                ? "border-melt-orange bg-melt-orange font-semibold text-surface"
                : "border-ink/10 bg-surface text-ink",
            )}
          >
            <span aria-hidden>{i.emoji}</span>
            {i.label}
          </button>
        );
      })}
    </div>
  );
}

/** Optional device location, rounded to ~5 km before it leaves the phone. */
export function LocationField({
  hasLocation,
  onLocation,
}: {
  hasLocation: boolean;
  onLocation: (loc: { lat: number; lng: number } | null) => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const pick = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await onLocation(await getRoundedBrowserLocation());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-4">
      <p className="text-sm text-ink">
        {hasLocation ? "📍 Approximate location saved." : "Show how far away people are?"}
      </p>
      <p className="mt-1 text-xs text-ink/60">
        Optional. We round your position to about 5 km on your phone before saving it, and others
        only ever see a distance, never your location.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="flex h-10 items-center gap-2 rounded-full bg-melt-peach/60 px-4 text-sm font-semibold text-ink active:scale-95 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {hasLocation ? "Update location" : "Use my location"}
        </button>
        {hasLocation && (
          <button
            type="button"
            onClick={() => onLocation(null)}
            className="h-10 rounded-full px-4 text-sm font-semibold text-ink/60 active:scale-95"
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-melt-orange">
          {error}
        </p>
      )}
    </div>
  );
}

export function PhotoManager({
  photos,
  onAdd,
  onRemove,
  onMakeMain,
}: {
  photos: MyPhoto[];
  onAdd: (file: File) => Promise<void>;
  onRemove: (photo: MyPhoto) => Promise<void>;
  onMakeMain: (photo: MyPhoto) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const urls = useSignedUrls(photos.map((p) => p.storage_path)).data ?? {};

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={p.id} className="relative overflow-hidden rounded-2xl bg-melt-peach/30">
            {urls[p.storage_path] ? (
              <img src={urls[p.storage_path]} alt="" className="aspect-[3/4] w-full object-cover" />
            ) : (
              <div className="aspect-[3/4] w-full animate-pulse" />
            )}
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-melt-orange px-2 py-0.5 text-[10px] font-semibold text-surface">
                Main
              </span>
            )}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              {i > 0 ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onMakeMain(p))}
                  aria-label="Make main photo"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink shadow"
                >
                  <Star className="h-4 w-4" />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => onRemove(p))}
                aria-label="Remove photo"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink shadow"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/15 bg-surface text-xs font-semibold text-ink/60 active:scale-95 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            {busy ? "Uploading…" : "Add photo"}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) run(() => onAdd(file));
        }}
      />
      <p className="mt-2 text-xs text-ink/50">
        Up to {MAX_PHOTOS} photos. We remove hidden metadata (like GPS) before uploading.
      </p>
    </div>
  );
}

/** Pick up to 3 sport prompts and answer them (as in the original design). */
export function PromptEditor({
  value,
  onChange,
}: {
  value: PromptDraft[];
  onChange: (v: PromptDraft[]) => void;
}) {
  const used = new Set(value.map((p) => p.question));
  const unused = PROMPT_QUESTIONS.filter((q) => !used.has(q));
  const update = (i: number, patch: Partial<PromptDraft>) =>
    onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-3">
      {value.map((p, i) => (
        <div key={i} className="rounded-3xl bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <select
              value={p.question}
              onChange={(e) => update(i, { question: e.target.value })}
              aria-label="Prompt question"
              className="h-10 min-w-0 flex-1 rounded-full border border-ink/10 bg-page px-3 text-xs font-semibold uppercase tracking-wide text-melt-orange outline-none focus:border-melt-orange"
            >
              {[p.question, ...unused].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove prompt"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/50 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={p.answer}
            onChange={(e) => update(i, { answer: e.target.value })}
            maxLength={PROMPT_ANSWER_MAX}
            rows={2}
            placeholder="Your answer…"
            className="mt-3 w-full resize-none bg-transparent font-serif text-xl leading-snug text-ink outline-none placeholder:text-ink/30"
          />
          <p className="text-right text-[10px] text-ink/40">
            {p.answer.length}/{PROMPT_ANSWER_MAX}
          </p>
        </div>
      ))}
      {value.length < MAX_PROMPTS && unused.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([...value, { question: unused[0], answer: "" }])}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/15 bg-surface text-sm font-semibold text-ink/60 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add a prompt ({value.length}/{MAX_PROMPTS})
        </button>
      )}
    </div>
  );
}
