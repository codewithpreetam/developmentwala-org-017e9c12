import { createFileRoute } from "@tanstack/react-router";
import Fellowships from "@/pages/Fellowships";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/fellowships/")({
  head: () => listingHead({
    title: "Fellowships in India for Social Impact Leaders | DevelopmentWala.org",
    description: "Explore prestigious fellowships in India across social impact, public policy, health, education and climate sectors. Find your next development-sector fellowship.",
    path: "/fellowships",
    collectionName: "Fellowships in India",
  }),
  component: () => <Fellowships />,
});
