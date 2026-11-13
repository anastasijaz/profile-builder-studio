/** Bump this whenever the terms or privacy policy change materially. */
export const CONSENT_VERSION = "2026-11-12";

export type SignupConsent = {
  adult: boolean;
  terms: boolean;
  privacy: boolean;
  version: string;
  accepted_at: string;
};

export function buildConsent(now = new Date()): SignupConsent {
  return {
    adult: true,
    terms: true,
    privacy: true,
    version: CONSENT_VERSION,
    accepted_at: now.toISOString(),
  };
}

/** True when the user's auth metadata holds a complete signup consent. */
export function hasValidConsent(meta: unknown): boolean {
  const c = (meta as { consent?: Partial<SignupConsent> } | null)?.consent;
  return Boolean(c && c.adult === true && c.terms === true && c.privacy === true);
}
