import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { gateRedirect, isPublicPath, type AuthStatus } from "./auth-gate";
import { MeltWordmark } from "@/components/MeltWordmark";

type AuthState = { status: AuthStatus; session: Session | null; user: User | null };

const AuthContext = createContext<AuthState>({ status: "loading", session: null, user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", session: null, user: null });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ status: "unconfigured", session: null, user: null });
      return;
    }
    const supabase = getSupabase();
    const apply = (session: Session | null) =>
      setState({
        status: session ? "signed-in" : "signed-out",
        session,
        user: session?.user ?? null,
      });

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      apply(session);
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** The signed-in user. Only call inside pages protected by AuthGate. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("useUser() called without a signed-in user");
  return user;
}

export type MyProfileRow = {
  id: string;
  display_name: string;
  birthdate: string;
  city: string;
  bio: string;
  onboarded_at: string | null;
};

export const myProfileKey = (uid: string | undefined) => ["my-profile", uid] as const;

/** The current user's own profile row, or null if onboarding hasn't started. */
export function useMyProfileRow() {
  const { user } = useAuth();
  return useQuery({
    queryKey: myProfileKey(user?.id),
    enabled: Boolean(user),
    queryFn: async (): Promise<MyProfileRow | null> => {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id, display_name, birthdate, city, bio, onboarded_at")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/**
 * Sends signed-out users to /welcome and unfinished profiles to /onboarding.
 * Protected pages render a splash until auth state is known, so the server
 * render and the first client render match.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const profile = useMyProfileRow();

  const onboarded =
    status !== "signed-in"
      ? undefined
      : profile.isSuccess
        ? Boolean(profile.data?.onboarded_at)
        : undefined;
  const target = gateRedirect({ status, onboarded, pathname });

  useEffect(() => {
    if (target && target !== pathname) navigate({ to: target, replace: true });
  }, [target, pathname, navigate]);

  if (status === "unconfigured") return <NotConfigured />;
  if (isPublicPath(pathname) && !target) return <>{children}</>;
  if (target || status === "loading" || (status === "signed-in" && onboarded === undefined)) {
    if (profile.isError)
      return <Splash message="Couldn't load your profile. Check your connection and reload." />;
    return <Splash />;
  }
  return <>{children}</>;
}

function Splash({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-page px-6 text-center">
      <MeltWordmark className="text-5xl motion-safe:animate-pulse" />
      {message && <p className="max-w-xs text-sm text-ink/60">{message}</p>}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-page px-6 text-center">
      <MeltWordmark className="text-5xl" />
      <p className="max-w-sm text-sm text-ink/70">
        Supabase isn't configured yet. Copy <code>.env.example</code> to <code>.env.local</code>,
        fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart
        the dev server.
      </p>
    </div>
  );
}
