import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { MeltWordmark } from "@/components/MeltWordmark";
import { CheckRow, Field, PrimaryButton, TextArea, TextInput } from "@/components/FormBits";
import { InterestPicker, LocationField, PhotoManager } from "@/components/ProfileFields";
import { signOut, useUser } from "@/lib/auth";
import { buildConsent, hasValidConsent } from "@/lib/consent";
import { maxAdultBirthdate } from "@/lib/age";
import { getSupabase } from "@/lib/supabase";
import { useInterests } from "@/lib/api/interests";
import { photoActions } from "@/lib/api/photo-actions";
import {
  errorMessage,
  finishOnboarding,
  saveBasics,
  saveBio,
  saveInterests,
  saveLocation,
  useMyFullProfile,
  useRefreshMyProfile,
} from "@/lib/api/profiles";
import {
  basicsSchema,
  bioSchema,
  BIO_MAX,
  fieldErrors,
  interestsSchema,
} from "@/lib/profile-schema";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({ meta: [{ title: "Set up your profile — Melt" }] }),
});

const STEPS = ["About you", "Your sports", "Your bio", "Your photos"] as const;

function OnboardingPage() {
  const user = useUser();
  const navigate = useNavigate();
  const profile = useMyFullProfile();
  const interests = useInterests();
  const refresh = useRefreshMyProfile();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ displayName: "", birthdate: "", city: "", bio: "" });
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [consent, setConsent] = useState({ adult: false, terms: false, privacy: false });
  const needsConsent = !hasValidConsent(user.user_metadata);

  // Resume where the user left off.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated || !profile.data) return;
    const p = profile.data;
    setForm({ displayName: p.displayName, birthdate: p.birthdate, city: p.city, bio: p.bio });
    setPicked(p.interestIds);
    setStep(!p.exists ? 0 : p.interestIds.length === 0 ? 1 : p.photos.length === 0 ? 2 : 3);
    setHydrated(true);
  }, [profile.data, hydrated]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      await refresh();
      setStep((s) => s + 1);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const nextBasics = () => {
    const errs = fieldErrors(basicsSchema, form);
    if (needsConsent && !(consent.adult && consent.terms && consent.privacy)) {
      errs.consent = "Please confirm all three to continue.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    save(async () => {
      if (needsConsent) {
        const { error } = await getSupabase().auth.updateUser({
          data: { consent: buildConsent() },
        });
        if (error) throw error;
      }
      await saveBasics(user.id, profile.data!.exists, form);
      if (pendingLocation) await saveLocation(user.id, pendingLocation);
    });
  };

  const nextInterests = () => {
    const errs = fieldErrors(interestsSchema, picked);
    setErrors(errs._ ? { interests: errs._ } : {});
    if (errs._) return;
    save(() => saveInterests(user.id, profile.data!.interestIds, picked));
  };

  const nextBio = () => {
    const errs = fieldErrors(bioSchema, form.bio);
    setErrors(errs._ ? { bio: errs._ } : {});
    if (errs._) return;
    save(() => saveBio(user.id, form.bio));
  };

  const finish = async () => {
    setSaving(true);
    try {
      await finishOnboarding(user.id);
      await refresh();
      navigate({ to: "/discover", replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!profile.data || !interests.data || !hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-page">
        <MeltWordmark className="text-5xl motion-safe:animate-pulse" />
      </div>
    );
  }

  const photos = profile.data.photos;
  const actions = photoActions(user.id, photos, refresh);

  return (
    <div className="min-h-[100dvh] bg-page text-ink">
      <header
        className="sticky top-0 z-10 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-[480px] items-center gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="w-2" />
          )}
          <h1 className="flex-1 font-serif text-xl italic">{STEPS[step]}</h1>
          <span className="pr-2 text-xs text-ink/50">
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-[480px] overflow-hidden rounded-full bg-ink/5">
          <div
            className="h-full rounded-full bg-melt-orange transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[480px] space-y-5 px-5 py-6 pb-32">
        {step === 0 && (
          <>
            <p className="text-sm text-ink/60">
              Let's set up your profile. It only takes a minute.
            </p>
            <Field label="First name" error={errors.displayName}>
              <TextInput
                value={form.displayName}
                onChange={set("displayName")}
                placeholder="Alex"
                maxLength={40}
                autoComplete="given-name"
              />
            </Field>
            <Field
              label="Birthdate"
              error={errors.birthdate}
              hint="You must be 18 or older. Only your age is shown, and it can't be changed later."
            >
              <TextInput
                type="date"
                value={form.birthdate}
                onChange={set("birthdate")}
                min="1900-01-01"
                max={maxAdultBirthdate()}
                autoComplete="bday"
              />
            </Field>
            <Field label="City" error={errors.city}>
              <TextInput
                value={form.city}
                onChange={set("city")}
                placeholder="Erlangen"
                maxLength={80}
                autoComplete="address-level2"
              />
            </Field>
            <LocationField
              hasLocation={Boolean(pendingLocation) || profile.data.hasLocation}
              onLocation={async (loc) => {
                setPendingLocation(loc);
                // Once the profile row exists the location can be saved right away.
                if (profile.data!.exists) {
                  try {
                    await saveLocation(user.id, loc);
                    await refresh();
                  } catch (e) {
                    toast.error(errorMessage(e));
                  }
                }
              }}
            />
            {needsConsent && (
              <div className="rounded-2xl border border-ink/10 bg-surface p-4">
                <CheckRow
                  checked={consent.adult}
                  onChange={(v) => setConsent((c) => ({ ...c, adult: v }))}
                >
                  I'm 18 or older.
                </CheckRow>
                <CheckRow
                  checked={consent.terms}
                  onChange={(v) => setConsent((c) => ({ ...c, terms: v }))}
                >
                  I accept the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-melt-orange underline"
                  >
                    Terms of Use
                  </a>
                  .
                </CheckRow>
                <CheckRow
                  checked={consent.privacy}
                  onChange={(v) => setConsent((c) => ({ ...c, privacy: v }))}
                >
                  I've read the{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-melt-orange underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </CheckRow>
                {errors.consent && (
                  <p className="mt-1 text-xs text-melt-orange">{errors.consent}</p>
                )}
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-ink/60">
              Pick the sports you love. We'll show you people who share them first.
            </p>
            <InterestPicker interests={interests.data.list} value={picked} onChange={setPicked} />
            {errors.interests && <p className="text-xs text-melt-orange">{errors.interests}</p>}
          </>
        )}

        {step === 2 && (
          <Field
            label="Short bio (optional)"
            error={errors.bio}
            hint={`${form.bio.length}/${BIO_MAX}`}
          >
            <TextArea
              value={form.bio}
              onChange={set("bio")}
              rows={5}
              maxLength={BIO_MAX}
              placeholder="Currently training for… / Post-workout ritual… / How to approach me at the gym…"
            />
          </Field>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-ink/60">
              Add at least one photo where your face is clearly visible.
            </p>
            <PhotoManager photos={photos} {...actions} />
          </>
        )}

        <button
          onClick={() => signOut()}
          className="block w-full pt-4 text-center text-xs text-ink/50"
        >
          Sign out
        </button>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/5 bg-surface/95 px-5 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="mx-auto max-w-[480px]">
          {step === 0 && (
            <PrimaryButton onClick={nextBasics} disabled={saving}>
              {saving ? "Saving…" : "Continue"}
            </PrimaryButton>
          )}
          {step === 1 && (
            <PrimaryButton onClick={nextInterests} disabled={saving || picked.length === 0}>
              {saving ? "Saving…" : "Continue"}
            </PrimaryButton>
          )}
          {step === 2 && (
            <PrimaryButton onClick={nextBio} disabled={saving}>
              {saving ? "Saving…" : "Continue"}
            </PrimaryButton>
          )}
          {step === 3 && (
            <PrimaryButton onClick={finish} disabled={saving || photos.length === 0}>
              {saving ? "Finishing…" : "Start melting"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
