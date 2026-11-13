import { toast } from "sonner";
import { deleteProfilePhoto, reorderProfilePhotos, uploadProfilePhoto } from "./photos";
import { errorMessage, type MyPhoto } from "./profiles";

/** Add / remove / reorder handlers for PhotoManager, with error toasts. */
export function photoActions(uid: string, photos: MyPhoto[], refresh: () => Promise<unknown>) {
  const guard = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      await refresh();
    }
  };
  return {
    onAdd: (file: File) =>
      guard(() => {
        // Next free slot (positions are 0–5 in the database).
        // Append after the last photo; if slot 5 is taken, reuse the first free one.
        const used = new Set(photos.map((p) => p.position));
        const last = Math.max(-1, ...used);
        const position = last < 5 ? last + 1 : ([0, 1, 2, 3, 4, 5].find((n) => !used.has(n)) ?? 5);
        return uploadProfilePhoto(uid, file, position);
      }),
    onRemove: (photo: MyPhoto) =>
      guard(async () => {
        if (photos.length <= 1) throw new Error("Keep at least one photo. Add another first.");
        await deleteProfilePhoto(photo.id, photo.storage_path);
      }),
    onMakeMain: (photo: MyPhoto) =>
      guard(() =>
        reorderProfilePhotos([
          photo.id,
          ...photos.filter((p) => p.id !== photo.id).map((p) => p.id),
        ]),
      ),
  };
}
