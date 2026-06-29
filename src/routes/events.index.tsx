import { createFileRoute } from "@tanstack/react-router";
import Events from "@/pages/Events";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/events/")({
  head: () => listingHead({
    title: "Social Sector Events, Conferences & Webinars in India | DevelopmentWala.org",
    description: "Stay updated on upcoming social sector events, conferences, workshops and webinars across India. Network with NGOs, funders and change leaders.",
    path: "/events",
    collectionName: "Social Sector Events in India",
  }),
  component: () => <Events />,
});
