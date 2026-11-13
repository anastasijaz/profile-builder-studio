import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../supabase";
import type { Interest } from "./types";

export function useInterests() {
  return useQuery({
    queryKey: ["interests"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("interests")
        .select("id, slug, label, emoji")
        .order("sort_order");
      if (error) throw error;
      const list = data as Interest[];
      return { list, byId: new Map(list.map((i) => [i.id, i])) };
    },
  });
}
