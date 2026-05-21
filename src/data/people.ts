import sara1 from "@/assets/p-sara.jpg";
import sara2 from "@/assets/p-sara-2.jpg";
import leo from "@/assets/p-leo.jpg";
import mia from "@/assets/p-mia.jpg";
import tom1 from "@/assets/tom-1.jpg";
import tom2 from "@/assets/tom-2.jpg";

export type Prompt = { question: string; answer: string };

export type Person = {
  id: string;
  name: string;
  age: number;
  distanceKm: number;
  location: string;
  bio: string;
  sports: string[];
  sharedActivities: { label: string; emoji: string }[];
  basicInfo: { label: string; icon: "work" | "school" | "gym" | "club"; verified?: boolean }[];
  photos: string[];
  prompts: Prompt[];
};

export const PEOPLE: Person[] = [
  {
    id: "sara",
    name: "Sara",
    age: 29,
    distanceKm: 3,
    location: "Erlangen",
    bio: "Boulderer, slow runner, faster eater.",
    sports: ["Climbing", "Running", "Yoga"],
    sharedActivities: [
      { label: "Climbing", emoji: "🧗" },
      { label: "Running", emoji: "👟" },
      { label: "Yoga", emoji: "🧘" },
    ],
    basicInfo: [
      { label: "Designer at Adidas", icon: "work" },
      { label: "TU München", icon: "school" },
      { label: "Boulderwelt", icon: "gym", verified: true },
      { label: "Run Club Erlangen", icon: "club", verified: true },
    ],
    photos: [sara1, sara2],
    prompts: [
      { question: "Currently training for…", answer: "My first 6c outdoor — Frankenjura in May." },
      { question: "My current PR is…", answer: "10k in 47:30. Slowly chipping at it." },
      { question: "How to approach me at the gym", answer: "Spot me on the overhang and we're 80% there." },
      { question: "Favourite snack bar", answer: "Peanut butter + banana on rye, no negotiations." },
    ],
  },
  {
    id: "leo",
    name: "Leo",
    age: 31,
    distanceKm: 5,
    location: "Nürnberg",
    bio: "Marathon nerd, espresso enthusiast.",
    sports: ["Running", "Cycling"],
    sharedActivities: [
      { label: "Running", emoji: "👟" },
      { label: "Cycling", emoji: "🚴" },
      { label: "Gym", emoji: "🏋️" },
    ],
    basicInfo: [
      { label: "Product at Strava", icon: "work" },
      { label: "FAU Erlangen", icon: "school" },
      { label: "McFit", icon: "gym", verified: true },
      { label: "Run Club Erlangen", icon: "club", verified: true },
    ],
    photos: [leo],
    prompts: [
      { question: "Currently training for…", answer: "Berlin Marathon. Sub-3 or bust." },
      { question: "Post-workout ritual", answer: "Cold shower, oat-milk flat white, repeat." },
      { question: "Race I'd do with a stranger", answer: "A messy 5k followed by ramen." },
    ],
  },
  {
    id: "mia",
    name: "Mia",
    age: 27,
    distanceKm: 2,
    location: "Erlangen",
    bio: "Yoga teacher who also lifts heavy things.",
    sports: ["Yoga", "Pilates", "Lifting"],
    sharedActivities: [
      { label: "Yoga", emoji: "🧘" },
      { label: "Pilates", emoji: "🤸" },
      { label: "Gym", emoji: "🏋️" },
    ],
    basicInfo: [
      { label: "Yoga teacher", icon: "work" },
      { label: "FAU Erlangen", icon: "school" },
      { label: "McFit", icon: "gym", verified: true },
    ],
    photos: [mia],
    prompts: [
      { question: "My sport origin story", answer: "Got dragged to a class at 16, never left the mat." },
      { question: "How to approach me at the gym", answer: "Ask which playlist I'm on. Always the right answer." },
      { question: "Favourite snack bar", answer: "Anything with tahini and dark chocolate." },
    ],
  },
  {
    id: "tom",
    name: "Tom",
    age: 33,
    distanceKm: 4,
    location: "Erlangen",
    bio: "Surfer in spirit, runner in practice.",
    sports: ["Surfing", "Running", "Hyrox"],
    sharedActivities: [
      { label: "Surfing", emoji: "🏄" },
      { label: "Running", emoji: "👟" },
      { label: "Gym", emoji: "🏋️" },
      { label: "Skiing", emoji: "🎿" },
      { label: "Hyrox", emoji: "⛓️" },
    ],
    basicInfo: [
      { label: "Marketing at Puma", icon: "work" },
      { label: "Friedrich Alexander Universität", icon: "school" },
      { label: "McFit", icon: "gym", verified: true },
      { label: "Run Club Erlangen", icon: "club", verified: true },
    ],
    photos: [tom1, tom2],
    prompts: [
      { question: "My simple pleasures", answer: "Sunset surf, espresso, river runs in that order." },
      { question: "Currently training for…", answer: "Hyrox Berlin — sled push haunts my dreams." },
      { question: "Race I'd do with a stranger", answer: "Any trail half. Loser buys the Apfelschorle." },
    ],
  },
];
