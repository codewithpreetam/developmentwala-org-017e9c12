import { createFileRoute } from "@tanstack/react-router";
import Scholarships from "@/pages/Scholarships";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/scholarships/")({
  head: () => listingHead({
    title: "Scholarships in India for Students & Researchers | DevelopmentWala.org",
    description: "Find scholarships in India for undergraduate, postgraduate and research programs. Curated funding opportunities from NGOs, foundations and government institutions.",
    path: "/scholarships",
    collectionName: "Scholarships in India",
  }),
  component: () => <Scholarships />,
});
