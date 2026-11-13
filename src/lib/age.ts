/** Parse "YYYY-MM-DD" without timezone surprises. */
function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** Full years between birthdate ("YYYY-MM-DD") and today. */
export function ageFrom(birthdate: string, today: Date = new Date()): number {
  const b = parseDate(birthdate);
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  let age = ty - b.y;
  if (tm < b.m || (tm === b.m && td < b.d)) age--;
  return age;
}

/** Same rule as the database trigger: 18 or older today. */
export function isAdult(birthdate: string, today: Date = new Date()): boolean {
  return ageFrom(birthdate, today) >= 18;
}

/** Latest birthdate that's 18+ today, as "YYYY-MM-DD" (for the date input's max). */
export function maxAdultBirthdate(today: Date = new Date()): string {
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  // new Date() rolls Feb 29 over to Mar 1 in non-leap years; step back to Feb 28.
  if (d.getMonth() !== today.getMonth()) d.setDate(0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
