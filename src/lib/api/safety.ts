import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../supabase";
import { useAuth } from "../auth";
import { PHOTO_BUCKET } from "./photos";

export const REPORT_REASONS = [
  { value: "fake_profile", label: "Fake profile or scam" },
  { value: "harassment", label: "Harassment or threats" },
  { value: "inappropriate_photos", label: "Inappropriate photos" },
  { value: "underage", label: "Might be under 18" },
  { value: "spam", label: "Spam or advertising" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export async function reportUser(input: {
  reporter: string;
  reported: string;
  reason: ReportReason;
  details: string;
  messageId?: string;
}) {
  const { error } = await getSupabase()
    .from("reports")
    .insert({
      reporter: input.reporter,
      reported: input.reported,
      reason: input.reason,
      details: input.details.trim().slice(0, 1000),
      message_id: input.messageId ?? null,
    });
  if (error) throw error;
}

export async function blockUser(blocker: string, blocked: string) {
  const { error } = await getSupabase()
    .from("blocks")
    .upsert({ blocker, blocked }, { onConflict: "blocker,blocked", ignoreDuplicates: true });
  if (error) throw error;
}

export async function unblockUser(blocker: string, blocked: string) {
  const { error } = await getSupabase()
    .from("blocks")
    .delete()
    .eq("blocker", blocker)
    .eq("blocked", blocked);
  if (error) throw error;
}

/** Refresh every list a block/unblock can affect. */
export function useInvalidateSocial() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      ["discover", "likes-received", "matches", "profile-card", "my-blocks"].map((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      ),
    );
}

export function useMyBlocks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-blocks", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("my_blocks");
      if (error) throw error;
      return data as { blocked: string; display_name: string; created_at: string }[];
    },
  });
}

/** Download everything Melt stores about the user as a JSON file. */
export async function downloadMyData() {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("export_my_data");
  if (error) throw error;
  const exported = data as { photos?: { storage_path: string; signed_url?: string }[] };
  // Add short-lived download links so the photos themselves can be saved too.
  const paths = (exported.photos ?? []).map((p) => p.storage_path);
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(paths, 60 * 60 * 24);
    for (const p of exported.photos ?? []) {
      p.signed_url = signed?.find((s) => s.path === p.storage_path)?.signedUrl ?? undefined;
    }
  }
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `melt-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Remove photo files, then delete the account (everything else cascades). */
export async function deleteMyAccount(uid: string) {
  const supabase = getSupabase();
  const { data: files, error: listError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list(uid, { limit: 100 });
  if (listError) throw listError;
  if (files?.length) {
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .remove(files.map((f) => `${uid}/${f.name}`));
    if (error) throw error;
  }
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  await supabase.auth.signOut({ scope: "local" });
}
