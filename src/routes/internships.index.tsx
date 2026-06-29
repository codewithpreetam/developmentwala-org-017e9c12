import { createFileRoute } from "@tanstack/react-router";
import Internships from "@/pages/Internships";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/internships/")({
  head: () => listingHead({
    title: "NGO & Development Sector Internships in India | DevelopmentWala.org",
    description: "Discover internships with NGOs, social enterprises and development organisations across India. Filter by location, sector and stipend on DevelopmentWala.org.",
    path: "/internships",
    collectionName: "NGO Internships in India",
  }),
  component: () => <Internships />,
});
