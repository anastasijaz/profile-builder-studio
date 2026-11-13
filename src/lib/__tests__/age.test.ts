import { describe, expect, it } from "vitest";
import { ageFrom, isAdult, maxAdultBirthdate } from "../age";

const day = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

describe("ageFrom", () => {
  it("counts full years", () => {
    expect(ageFrom("1990-06-15", day("2026-06-14"))).toBe(35);
    expect(ageFrom("1990-06-15", day("2026-06-15"))).toBe(36);
  });
});

describe("isAdult (same rule as the DB trigger)", () => {
  it("is false the day before the 18th birthday", () => {
    expect(isAdult("2008-11-13", day("2026-11-12"))).toBe(false);
  });
  it("is true on the 18th birthday", () => {
    expect(isAdult("2008-11-12", day("2026-11-12"))).toBe(true);
  });
  it("treats a 29 Feb birthday as reached on 1 Mar in non-leap years", () => {
    expect(isAdult("2008-02-29", day("2026-02-28"))).toBe(false);
    expect(isAdult("2008-02-29", day("2026-03-01"))).toBe(true);
  });
});

describe("maxAdultBirthdate", () => {
  it("is exactly 18 years ago", () => {
    expect(maxAdultBirthdate(day("2026-11-12"))).toBe("2008-11-12");
  });
  it("never returns a date that is under 18 (leap day)", () => {
    const max = maxAdultBirthdate(day("2028-02-29"));
    expect(max).toBe("2010-02-28");
    expect(isAdult(max, day("2028-02-29"))).toBe(true);
  });
});
