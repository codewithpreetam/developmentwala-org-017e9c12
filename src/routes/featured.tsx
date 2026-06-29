import { createFileRoute } from "@tanstack/react-router";
import Featured from "@/pages/Featured";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/featured")({
  head: () => listingHead({
    title: "Featured Opportunities in the Social Sector | DevelopmentWala.org",
    description: "Hand-picked featured jobs, internships, fellowships, scholarships and grants from leading NGOs and changemakers across India.",
    path: "/featured",
    collectionName: "Featured Opportunities",
  }),
  component: Featured,
});
