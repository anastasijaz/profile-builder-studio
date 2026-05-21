import { PEOPLE } from "./people";

export type Message = { id: string; from: "me" | "them"; text: string; ts: string };
export type Match = {
  id: string;
  personId: string;
  lastMessage: string;
  unread: number;
  messages: Message[];
};

export const MATCHES: Match[] = [
  {
    id: "m-sara",
    personId: "sara",
    lastMessage: "Saturday 9am, river loop?",
    unread: 2,
    messages: [
      { id: "1", from: "them", text: "You melted on my Frankenjura prompt 👀", ts: "Yesterday" },
      { id: "2", from: "me", text: "Guilty. Got a project in mind?", ts: "Yesterday" },
      { id: "3", from: "them", text: "Always. What about a run this weekend first?", ts: "10:02" },
      { id: "4", from: "them", text: "Saturday 9am, river loop?", ts: "10:03" },
    ],
  },
  {
    id: "m-leo",
    personId: "leo",
    lastMessage: "Coffee post-run is non-negotiable.",
    unread: 0,
    messages: [
      { id: "1", from: "me", text: "Sub-3 huh? Brave.", ts: "Tue" },
      { id: "2", from: "them", text: "Coffee post-run is non-negotiable.", ts: "Tue" },
    ],
  },
  {
    id: "m-mia",
    personId: "mia",
    lastMessage: "What's your playlist?",
    unread: 1,
    messages: [
      { id: "1", from: "them", text: "What's your playlist?", ts: "Mon" },
    ],
  },
];

export function getMatch(id: string) {
  const m = MATCHES.find((x) => x.id === id);
  if (!m) return null;
  const person = PEOPLE.find((p) => p.id === m.personId)!;
  return { match: m, person };
}
