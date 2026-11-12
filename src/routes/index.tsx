import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melt — Sports dating" },
      { name: "description", content: "Find your sports crush and melt together." },
      { property: "og:title", content: "Melt — Sports dating" },
      { property: "og:description", content: "Find your sports crush and melt together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/discover" });
  },
});
