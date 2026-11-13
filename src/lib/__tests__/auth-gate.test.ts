import { describe, expect, it } from "vitest";
import { gateRedirect, isPublicPath } from "../auth-gate";
import { buildConsent, hasValidConsent } from "../consent";

const gate = (
  status: Parameters<typeof gateRedirect>[0]["status"],
  onboarded: boolean | undefined,
  pathname: string,
) => gateRedirect({ status, onboarded, pathname });

describe("gateRedirect", () => {
  it("waits while auth is loading", () => {
    expect(gate("loading", undefined, "/discover")).toBeNull();
  });

  it("sends signed-out users to /welcome, except on public pages", () => {
    for (const p of ["/discover", "/chats/abc", "/profile", "/onboarding"]) {
      expect(gate("signed-out", undefined, p)).toBe("/welcome");
    }
    for (const p of ["/welcome", "/privacy", "/terms", "/auth/callback"]) {
      expect(gate("signed-out", undefined, p)).toBeNull();
    }
  });

  it("sends signed-in users without a finished profile to onboarding", () => {
    expect(gate("signed-in", false, "/discover")).toBe("/onboarding");
    expect(gate("signed-in", false, "/welcome")).toBe("/onboarding");
    expect(gate("signed-in", false, "/onboarding")).toBeNull();
    // Legal pages stay readable during onboarding.
    expect(gate("signed-in", false, "/privacy")).toBeNull();
  });

  it("keeps onboarded users out of welcome and onboarding", () => {
    expect(gate("signed-in", true, "/welcome")).toBe("/discover");
    expect(gate("signed-in", true, "/onboarding")).toBe("/discover");
    expect(gate("signed-in", true, "/chats")).toBeNull();
  });

  it("waits for the profile before deciding", () => {
    expect(gate("signed-in", undefined, "/discover")).toBeNull();
  });

  it("does not treat lookalike paths as public", () => {
    expect(isPublicPath("/welcomeback")).toBe(false);
    expect(isPublicPath("/terms")).toBe(true);
  });
});

describe("signup consent", () => {
  it("requires adult + terms + privacy", () => {
    expect(hasValidConsent({ consent: buildConsent() })).toBe(true);
    expect(hasValidConsent({ consent: { ...buildConsent(), adult: false } })).toBe(false);
    expect(hasValidConsent({})).toBe(false);
    expect(hasValidConsent(null)).toBe(false);
  });
});
