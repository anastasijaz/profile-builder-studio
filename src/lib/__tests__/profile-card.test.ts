import { describe, expect, it } from "vitest";
import { chipInterests, toProfileCard, type Interest, type ProfileCardRow } from "../api/types";

const interests: Interest[] = [
  { id: 1, slug: "running", label: "Running", emoji: "👟" },
  { id: 2, slug: "cycling", label: "Cycling", emoji: "🚴" },
  { id: 3, slug: "climbing", label: "Climbing", emoji: "🧗" },
];
const byId = new Map(interests.map((i) => [i.id, i]));

const row: ProfileCardRow = {
  id: "u1",
  display_name: "Sam",
  age: 29,
  city: "Erlangen",
  bio: "Trail runner",
  distance_km: 12,
  shared_interest_ids: [3],
  interest_ids: [1, 3],
  photo_paths: ["u1/a.jpg"],
  created_at: "2026-11-01T00:00:00Z",
};

describe("toProfileCard", () => {
  it("maps RPC rows to the UI shape", () => {
    expect(toProfileCard(row)).toEqual({
      id: "u1",
      name: "Sam",
      age: 29,
      city: "Erlangen",
      bio: "Trail runner",
      distanceKm: 12,
      sharedInterestIds: [3],
      interestIds: [1, 3],
      photoPaths: ["u1/a.jpg"],
      prompts: [],
      likedPrompt: null,
    });
  });

  it("tolerates nulls from Postgres", () => {
    const card = toProfileCard({
      ...row,
      bio: null as unknown as string,
      distance_km: null,
      shared_interest_ids: null,
      interest_ids: null,
      photo_paths: null,
    });
    expect(card.bio).toBe("");
    expect(card.distanceKm).toBeNull();
    expect(card.sharedInterestIds).toEqual([]);
    expect(card.photoPaths).toEqual([]);
  });
});

describe("chipInterests", () => {
  it("puts shared interests first and marks them", () => {
    const chips = chipInterests(toProfileCard(row), byId);
    expect(chips.map((c) => [c.label, c.shared])).toEqual([
      ["Climbing", true],
      ["Running", false],
    ]);
  });
  it("skips unknown interest ids", () => {
    const chips = chipInterests(toProfileCard({ ...row, interest_ids: [1, 99] }), byId);
    expect(chips.map((c) => c.id)).toEqual([1]);
  });
});
