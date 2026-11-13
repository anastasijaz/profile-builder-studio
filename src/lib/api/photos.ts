import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../supabase";

export const PHOTO_BUCKET = "profile-photos";
const URL_TTL_SECONDS = 60 * 60;

/** Signed URLs for private photos, keyed by storage path. */
export function useSignedUrls(paths: (string | null | undefined)[]) {
  const clean = Array.from(new Set(paths.filter((p): p is string => Boolean(p)))).sort();
  return useQuery({
    queryKey: ["signed-urls", clean],
    enabled: clean.length > 0,
    staleTime: (URL_TTL_SECONDS - 300) * 1000,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .storage.from(PHOTO_BUCKET)
        .createSignedUrls(clean, URL_TTL_SECONDS);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const item of data) if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
      return map;
    },
  });
}

/**
 * Downscale and re-encode a photo in the browser (also strips EXIF metadata
 * such as GPS position). Longest side max 1440px, JPEG ~0.85.
 */
export async function prepareImage(file: File, maxSide = 1440): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 20 * 1024 * 1024) throw new Error("That image is too large (max 20 MB).");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) throw new Error("Couldn't process the image.");
  return blob;
}

/** Upload a photo to the user's folder and register it on their profile. */
export async function uploadProfilePhoto(userId: string, file: File, position: number) {
  const supabase = getSupabase();
  const blob = await prepareImage(file);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const up = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (up.error) throw up.error;
  const { error } = await supabase
    .from("profile_photos")
    .insert({ user_id: userId, storage_path: path, position });
  if (error) {
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    throw error;
  }
  return path;
}

export async function deleteProfilePhoto(photoId: string, path: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
  if (error) throw error;
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

/** Persist a new photo order (first = main photo). */
export async function reorderProfilePhotos(ids: string[]) {
  const supabase = getSupabase();
  for (const [position, id] of ids.entries()) {
    const { error } = await supabase.from("profile_photos").update({ position }).eq("id", id);
    if (error) throw error;
  }
}
