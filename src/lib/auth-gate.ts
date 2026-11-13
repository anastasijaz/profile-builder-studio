export type AuthStatus = "loading" | "unconfigured" | "signed-out" | "signed-in";

/** Pages anyone can open without signing in. */
export const PUBLIC_PATHS = ["/welcome", "/auth/callback", "/privacy", "/terms", "/impressum"];
const LEGAL_PATHS = ["/privacy", "/terms", "/impressum"];

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Where should the user be sent, given their auth state? Returns null to stay.
 * `onboarded` is undefined while the profile is still loading.
 */
export function gateRedirect({
  status,
  onboarded,
  pathname,
}: {
  status: AuthStatus;
  onboarded: boolean | undefined;
  pathname: string;
}): string | null {
  if (status === "loading" || status === "unconfigured") return null;
  const isPublic = isPublicPath(pathname);

  if (status === "signed-out") {
    return isPublic ? null : "/welcome";
  }

  // Signed in.
  if (pathname === "/auth/callback") return null; // the callback navigates itself
  if (onboarded === undefined) return null;
  if (!onboarded) {
    if (pathname === "/onboarding" || LEGAL_PATHS.includes(pathname)) return null;
    return "/onboarding";
  }
  if (pathname === "/welcome" || pathname === "/onboarding") return "/discover";
  return null;
}
