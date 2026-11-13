import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../supabase";
import { myProfileKey, useAuth } from "../auth";
import { diffPrompts, type Prompt, type PromptDraft } from "../prompts";

/**
 * Save prompt answers. Existing prompts are updated in place (so likes that
 * were "melted on" them keep their link); removed ones are deleted.
 */
export async function savePrompts(uid: string, current: Prompt[], next: PromptDraft[]) {
  const supabase = getSupabase();
  const { remove, upsert } = diffPrompts(current, next);
  if (remove.length) {
    const { error } = await supabase.from("profile_prompts").delete().in("id", remove);
    if (error) throw error;
  }
  for (const p of upsert) {
    const { error } = p.id
      ? await supabase
          .from("profile_prompts")
          .update({ answer: p.answer, position: p.position })
          .eq("id", p.id)
      : await supabase.from("profile_prompts").insert({
          user_id: uid,
          question: p.question,
          answer: p.answer,
          position: p.position,
        });
    if (error) throw error;
  }
}

export type MyPhoto = { id: string; storage_path: string; position: number };

export type MyFullProfile = {
  exists: boolean;
  displayName: string;
  birthdate: string;
  city: string;
  bio: string;
  onboarded: boolean;
  interestIds: number[];
  photos: MyPhoto[];
  hasLocation: boolean;
  prompts: Prompt[];
};

export const myFullProfileKey = (uid: string | undefined) => ["my-full-profile", uid] as const;

export function useMyFullProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: myFullProfileKey(user?.id),
    enabled: Boolean(user),
    queryFn: async (): Promise<MyFullProfile> => {
      const supabase = getSupabase();
      const uid = user!.id;
      const [p, i, ph, loc, pr] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, birthdate, city, bio, onboarded_at")
          .eq("id", uid)
          .maybeSingle(),
        supabase.from("profile_interests").select("interest_id").eq("user_id", uid),
        supabase
          .from("profile_photos")
          .select("id, storage_path, position")
          .eq("user_id", uid)
          .order("position")
          .order("created_at"),
        supabase.from("profile_locations").select("user_id").eq("user_id", uid).maybeSingle(),
        supabase
          .from("profile_prompts")
          .select("id, question, answer")
          .eq("user_id", uid)
          .order("position"),
      ]);
      for (const r of [p, i, ph, loc, pr]) if (r.error) throw r.error;
      return {
        exists: Boolean(p.data),
        displayName: p.data?.display_name ?? "",
        birthdate: p.data?.birthdate ?? "",
        city: p.data?.city ?? "",
        bio: p.data?.bio ?? "",
        onboarded: Boolean(p.data?.onboarded_at),
        interestIds: (i.data ?? []).map((r) => r.interest_id as number),
        photos: (ph.data ?? []) as MyPhoto[],
        hasLocation: Boolean(loc.data),
        prompts: (pr.data ?? []) as Prompt[],
      };
    },
  });
}

/** Invalidate everything that depends on the current user's own profile. */
export function useRefreshMyProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: myFullProfileKey(user?.id) }),
      qc.invalidateQueries({ queryKey: myProfileKey(user?.id) }),
    ]);
}

export async function saveBasics(
  uid: string,
  exists: boolean,
  v: { displayName: string; birthdate: string; city: string },
) {
  const supabase = getSupabase();
  const row = { display_name: v.displayName.trim(), birthdate: v.birthdate, city: v.city.trim() };
  const { error } = exists
    ? await supabase.from("profiles").update(row).eq("id", uid)
    : await supabase.from("profiles").insert({ id: uid, ...row });
  if (error) throw error;
}

export async function saveBio(uid: string, bio: string) {
  const { error } = await getSupabase().from("profiles").update({ bio: bio.trim() }).eq("id", uid);
  if (error) throw error;
}

/** Store an already-rounded location, or clear it with null. */
export async function saveLocation(uid: string, loc: { lat: number; lng: number } | null) {
  const supabase = getSupabase();
  const { error } = loc
    ? await supabase
        .from("profile_locations")
        .upsert({ user_id: uid, lat: loc.lat, lng: loc.lng, updated_at: new Date().toISOString() })
    : await supabase.from("profile_locations").delete().eq("user_id", uid);
  if (error) throw error;
}

export async function saveInterests(uid: string, current: number[], next: number[]) {
  const supabase = getSupabase();
  const toAdd = next.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !next.includes(id));
  if (toAdd.length) {
    const { error } = await supabase
      .from("profile_interests")
      .insert(toAdd.map((interest_id) => ({ user_id: uid, interest_id })));
    if (error) throw error;
  }
  if (toRemove.length) {
    const { error } = await supabase
      .from("profile_interests")
      .delete()
      .eq("user_id", uid)
      .in("interest_id", toRemove);
    if (error) throw error;
  }
}

/** The database checks photo + interest exist before accepting this. */
export async function finishOnboarding(uid: string) {
  const { error } = await getSupabase()
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", uid);
  if (error) throw error;
}

/** Postgres/PostgREST errors carry readable messages from our triggers. */
export function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: string }).message);
  return "Something went wrong. Please try again.";
}
