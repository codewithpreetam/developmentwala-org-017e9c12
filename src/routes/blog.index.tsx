import { createFileRoute } from "@tanstack/react-router";
import Blog from "@/pages/Blog";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/blog/")({
  head: () => listingHead({
    title: "Development Sector Blog — Career Advice, NGO Insights & Impact Stories | DevelopmentWala.org",
    description: "Read expert articles on NGO careers, social impact, fundraising, CSR and development sector trends in India on the DevelopmentWala.org blog.",
    path: "/blog",
    collectionName: "DevelopmentWala Blog",
  }),
  component: () => <Blog />,
});
