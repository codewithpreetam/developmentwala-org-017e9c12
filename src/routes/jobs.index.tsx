import { createFileRoute } from "@tanstack/react-router";
import Jobs from "@/pages/Jobs";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/jobs/")({
  head: () => listingHead({
    title: "NGO & Social Sector Jobs in India | DevelopmentWala.org",
    description: "Browse the latest NGO, nonprofit and social sector jobs in India. Apply to roles from leading development organisations, foundations, CSR teams and impact-driven employers.",
    path: "/jobs",
    collectionName: "NGO Jobs in India",
  }),
  component: () => <Jobs />,
});
