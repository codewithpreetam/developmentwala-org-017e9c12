import { createFileRoute } from "@tanstack/react-router";
import Employers from "@/pages/Employers";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/employers")({
  head: () => listingHead({
    title: "Top NGOs & Social Sector Employers in India | DevelopmentWala.org",
    description: "Discover top NGOs, foundations and CSR teams hiring on DevelopmentWala.org. Browse verified employers driving social impact across India.",
    path: "/employers",
    collectionName: "Top Employers",
  }),
  component: () => <Employers />,
});
