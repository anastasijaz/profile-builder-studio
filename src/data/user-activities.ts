import { useSyncExternalStore } from "react";
import type { Activity } from "./activities";

const STORAGE_KEY = "melt.user-activities.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch {
    return [];
  }
}

let cache: Activity[] = read();

function write(next: Activity[]) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function addUserActivity(a: Omit<Activity, "id"> & { id?: string }): Activity {
  const created: Activity = {
    ...a,
    id: a.id ?? `u-${Date.now().toString(36)}`,
  };
  write([created, ...cache]);
  return created;
}

export function getUserActivities(): Activity[] {
  return cache;
}

export function useUserActivities(): Activity[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => cache,
    () => [],
  );
}
