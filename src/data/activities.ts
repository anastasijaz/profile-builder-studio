import actRun from "@/assets/act-run.jpg";
import actSquash from "@/assets/act-squash.jpg";
import actPilates from "@/assets/act-pilates.jpg";
import actReform from "@/assets/act-reform.jpg";

export type Activity = {
  id: string;
  image: string;
  gym: string;
  title: string;
  description: string;
  location: string;
  price: string;
  info: string;
  sport: string;
  day: string;
  time: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "run-club",
    image: actRun,
    gym: "Schlossgarten",
    title: "Run Club Erlangen",
    description: "We run a 7k every Saturday and grab coffee/brunch after.",
    location: "Schlossgarten",
    price: "10€",
    info: "Free for members",
    sport: "Running",
    day: "Sat",
    time: "9:00",
  },
  {
    id: "squash",
    image: actSquash,
    gym: "Sportland",
    title: "Singles Squash",
    description: "Singles meet up Thursdays and play squash together. Beginners welcome.",
    location: "Sportland",
    price: "12€",
    info: "For all levels",
    sport: "Squash",
    day: "Thu",
    time: "19:30",
  },
  {
    id: "pilates",
    image: actPilates,
    gym: "McFit",
    title: "Pilates Open Class",
    description: "Pilates class open to everyone. Bring a mat and an open mind.",
    location: "McFit",
    price: "10€",
    info: "Free for McFit Members",
    sport: "Pilates",
    day: "Mon",
    time: "18:00",
  },
  {
    id: "reform",
    image: actReform,
    gym: "John Reed",
    title: "Reform Pilates",
    description: "Reformer pilates for all levels in a sunlit studio.",
    location: "John Reed",
    price: "10€",
    info: "Free for JR Members",
    sport: "Pilates",
    day: "Wed",
    time: "19:00",
  },
];
