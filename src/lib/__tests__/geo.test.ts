import { describe, expect, it } from "vitest";
import { distanceLabel, haversineKm, roundCoord, roundLocation } from "../geo";

describe("location rounding", () => {
  it("snaps to the 0.05° grid", () => {
    expect(roundCoord(49.5897)).toBe(49.6);
    expect(roundCoord(11.0042)).toBe(11);
    expect(roundCoord(-0.026)).toBe(-0.05);
  });
  it("moves a point by at most ~3.5 km", () => {
    const exact = { lat: 49.5732, lng: 11.0259 };
    const rounded = roundLocation(exact.lat, exact.lng);
    expect(haversineKm(exact, rounded)).toBeLessThan(3.6);
  });
});

describe("haversineKm", () => {
  it("matches known distances", () => {
    const erlangen = { lat: 49.59, lng: 11.0 };
    const nuernberg = { lat: 49.45, lng: 11.08 };
    const berlin = { lat: 52.52, lng: 13.4 };
    expect(haversineKm(erlangen, nuernberg)).toBeGreaterThan(14);
    expect(haversineKm(erlangen, nuernberg)).toBeLessThan(18);
    expect(haversineKm(erlangen, berlin)).toBeGreaterThan(355);
    expect(haversineKm(erlangen, berlin)).toBeLessThan(370);
    expect(haversineKm(erlangen, erlangen)).toBe(0);
  });
});

describe("distanceLabel", () => {
  it("hides precision below the rounding grid", () => {
    expect(distanceLabel(null)).toBeNull();
    expect(distanceLabel(0)).toBe("less than 5 km away");
    expect(distanceLabel(4)).toBe("less than 5 km away");
    expect(distanceLabel(18)).toBe("~18 km away");
  });
});
