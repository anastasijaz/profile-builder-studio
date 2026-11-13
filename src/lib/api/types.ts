export type Interest = { id: number; slug: string; label: string; emoji: string };

/** Row shape returned by discover_candidates / get_profile_card / likes_received. */
export type ProfileCardRow = {
  id: string;
  display_name: string;
  age: number;
  city: string;
  bio: string;
  distance_km: number | null;
  shared_interest_ids: number[] | null;
  interest_ids: number[] | null;
  photo_paths: string[] | null;
  created_at: string;
};

/** What the UI renders for another person. */
export type ProfileCard = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  distanceKm: number | null;
  sharedInterestIds: number[];
  interestIds: number[];
  photoPaths: string[];
};

export function toProfileCard(row: ProfileCardRow): ProfileCard {
  return {
    id: row.id,
    name: row.display_name,
    age: row.age,
    city: row.city,
    bio: row.bio ?? "",
    distanceKm: row.distance_km ?? null,
    sharedInterestIds: row.shared_interest_ids ?? [],
    interestIds: row.interest_ids ?? [],
    photoPaths: row.photo_paths ?? [],
  };
}

/** Interests to show as chips: shared ones first, then the rest. */
export function chipInterests(card: ProfileCard, all: Map<number, Interest>) {
  const shared = new Set(card.sharedInterestIds);
  const ordered = [
    ...card.interestIds.filter((id) => shared.has(id)),
    ...card.interestIds.filter((id) => !shared.has(id)),
  ];
  return ordered
    .map((id) => all.get(id))
    .filter((i): i is Interest => Boolean(i))
    .map((i) => ({ ...i, shared: shared.has(i.id) }));
}

export type MatchSummary = {
  match_id: string;
  other_id: string;
  display_name: string;
  photo_path: string | null;
  last_body: string | null;
  last_at: string | null;
  last_sender: string | null;
  unread: number;
  matched_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
