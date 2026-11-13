import { describe, expect, it } from "vitest";
import { basicsSchema, bioSchema, fieldErrors, interestsSchema } from "../profile-schema";
import { maxAdultBirthdate } from "../age";

describe("onboarding schemas", () => {
  const valid = { displayName: "Alex", birthdate: "1995-04-01", city: "Erlangen" };

  it("accepts valid basics", () => {
    expect(fieldErrors(basicsSchema, valid)).toEqual({});
  });

  it("rejects under-18 birthdates", () => {
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 17);
    const iso = tooYoung.toISOString().slice(0, 10);
    expect(fieldErrors(basicsSchema, { ...valid, birthdate: iso }).birthdate).toMatch(/18/);
  });

  it("accepts someone turning 18 today", () => {
    expect(fieldErrors(basicsSchema, { ...valid, birthdate: maxAdultBirthdate() })).toEqual({});
  });

  it("requires name, city and a real date", () => {
    const errs = fieldErrors(basicsSchema, { displayName: "  ", birthdate: "", city: "" });
    expect(Object.keys(errs).sort()).toEqual(["birthdate", "city", "displayName"]);
    expect(fieldErrors(basicsSchema, { ...valid, birthdate: "1850-01-01" }).birthdate).toBeTruthy();
  });

  it("limits bio length", () => {
    expect(bioSchema.safeParse("x".repeat(300)).success).toBe(true);
    expect(bioSchema.safeParse("x".repeat(301)).success).toBe(false);
  });

  it("needs 1–10 interests", () => {
    expect(interestsSchema.safeParse([]).success).toBe(false);
    expect(interestsSchema.safeParse([1]).success).toBe(true);
    expect(interestsSchema.safeParse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).success).toBe(false);
  });
});
