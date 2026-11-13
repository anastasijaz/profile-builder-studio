import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Field, PrimaryButton, TextArea, TextInput } from "@/components/FormBits";
import { InterestPicker, LocationField, PhotoManager } from "@/components/ProfileFields";
import { useUser } from "@/lib/auth";
import { useInterests } from "@/lib/api/interests";
import { photoActions } from "@/lib/api/photo-actions";
import {
  errorMessage,
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
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/profile_/edit")({
  component: EditProfilePage,
  head: () => ({ meta: [{ title: "Edit profile — Melt" }] }),
});

function EditProfilePage() {
  const user = useUser();
  const profile = useMyFullProfile();
  const interests = useInterests();
  const refresh = useRefreshMyProfile();
  const qc = useQueryClient();

  const [form, setForm] = useState({ displayName: "", city: "", bio: "" });
  const [picked, setPicked] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !profile.data) return;
    setForm({
      displayName: profile.data.displayName,
      city: profile.data.city,
      bio: profile.data.bio,
    });
    setPicked(profile.data.interestIds);
    setLoaded(true);
  }, [profile.data, loaded]);

  if (!profile.data || !interests.data || !loaded) {
    return <div className="min-h-[100dvh] bg-page" />;
  }
  const p = profile.data;
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    const errs = {
      ...fieldErrors(basicsSchema, { ...form, birthdate: p.birthdate }),
      ...(fieldErrors(bioSchema, form.bio)._ ? { bio: fieldErrors(bioSchema, form.bio)._ } : {}),
      ...(fieldErrors(interestsSchema, picked)._
        ? { interests: fieldErrors(interestsSchema, picked)._ }
        : {}),
    };
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await saveBasics(user.id, true, { ...form, birthdate: p.birthdate });
      await saveBio(user.id, form.bio);
      await saveInterests(user.id, p.interestIds, picked);
      await refresh();
      qc.invalidateQueries({ queryKey: ["discover"] });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const actions = photoActions(user.id, p.photos, refresh);

  return (
    <div className="min-h-[100dvh] bg-page text-ink">
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/5 bg-surface/95 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Link
          to="/profile"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl italic text-ink">Edit profile</h1>
      </header>

      <div className="mx-auto max-w-[480px] space-y-6 px-5 py-5 pb-32">
        <Field label="Photos">
          <PhotoManager photos={p.photos} {...actions} />
        </Field>

        <Field label="First name" error={errors.displayName}>
          <TextInput value={form.displayName} onChange={set("displayName")} maxLength={40} />
        </Field>

        <Field label="City" error={errors.city}>
          <TextInput value={form.city} onChange={set("city")} maxLength={80} />
        </Field>

        <LocationField
          hasLocation={p.hasLocation}
          onLocation={async (loc) => {
            try {
              await saveLocation(user.id, loc);
              await refresh();
              qc.invalidateQueries({ queryKey: ["discover"] });
            } catch (e) {
              toast.error(errorMessage(e));
            }
          }}
        />

        <Field label="Your sports" error={errors.interests}>
          <InterestPicker interests={interests.data.list} value={picked} onChange={setPicked} />
        </Field>

        <Field label="Bio" error={errors.bio} hint={`${form.bio.length}/${BIO_MAX}`}>
          <TextArea value={form.bio} onChange={set("bio")} rows={5} maxLength={BIO_MAX} />
        </Field>

        <p className="text-xs text-ink/50">
          Birthdate: {p.birthdate}. To correct it, contact support.
        </p>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/5 bg-surface/95 px-5 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="mx-auto max-w-[480px]">
          <PrimaryButton onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
