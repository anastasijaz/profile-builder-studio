import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../supabase";
import { useAuth } from "../auth";
import { toProfileCard, type ProfileCardRow } from "./types";

export function useDiscover() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["discover", user?.id],
    enabled: Boolean(user),
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("discover_candidates", { p_limit: 30 });
      if (error) throw error;
      return (data as ProfileCardRow[]).map(toProfileCard);
    },
  });
}

export function useLikesReceived() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["likes-received", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("likes_received");
      if (error) throw error;
      return (data as ProfileCardRow[]).map(toProfileCard);
    },
  });
}

export function useProfileCard(userId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile-card", userId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("get_profile_card", { p_target: userId });
      if (error) throw error;
      const rows = data as ProfileCardRow[];
      return rows.length ? toProfileCard(rows[0]) : null;
    },
  });
}

/** Like or pass. Resolves to the match id when the like is mutual. */
export function useSwipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      kind,
      promptId,
    }: {
      target: string;
      kind: "like" | "pass";
      /** The prompt card the like was on, if any. */
      promptId?: string;
    }) => {
      const { data, error } = await getSupabase().rpc("swipe", {
        p_target: target,
        p_kind: kind,
        p_prompt: promptId ?? null,
      });
      if (error) throw error;
      return (data as string | null) ?? null;
    },
    onSuccess: (matchId) => {
      qc.invalidateQueries({ queryKey: ["likes-received"] });
      if (matchId) qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
