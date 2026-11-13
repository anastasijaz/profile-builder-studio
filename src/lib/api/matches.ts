import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../supabase";
import { useAuth } from "../auth";
import type { MatchSummary, Message } from "./types";

export function useMatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["matches", user?.id],
    enabled: Boolean(user),
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("my_matches");
      if (error) throw error;
      return data as MatchSummary[];
    },
  });
}

export function useMatch(matchId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["matches", user?.id, matchId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("my_matches", { p_match: matchId });
      if (error) throw error;
      return ((data as MatchSummary[])[0] ?? null) as MatchSummary | null;
    },
  });
}

const messagesKey = (matchId: string) => ["messages", matchId] as const;

function addUnique(list: Message[], msg: Message) {
  if (list.some((m) => m.id === msg.id)) return list;
  return [...list, msg].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** Message history plus live updates through Supabase Realtime. */
export function useMessages(matchId: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: messagesKey(matchId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("messages")
        .select("id, match_id, sender_id, body, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          qc.setQueryData<Message[]>(messagesKey(matchId), (old) =>
            addUnique(old ?? [], payload.new as Message),
          );
          qc.invalidateQueries({ queryKey: ["matches"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, qc]);

  return query;
}

export function useSendMessage(matchId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data, error } = await getSupabase()
        .from("messages")
        .insert({ match_id: matchId, sender_id: user!.id, body })
        .select("id, match_id, sender_id, body, created_at")
        .single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: (msg) => {
      qc.setQueryData<Message[]>(messagesKey(matchId), (old) => addUnique(old ?? [], msg));
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export async function markMatchRead(matchId: string, userId: string) {
  await getSupabase()
    .from("match_reads")
    .upsert(
      { match_id: matchId, user_id: userId, last_read_at: new Date().toISOString() },
      { onConflict: "match_id,user_id" },
    );
}
