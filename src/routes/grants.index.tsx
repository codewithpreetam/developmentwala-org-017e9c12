import { createFileRoute } from "@tanstack/react-router";
import Grants from "@/pages/Grants";
import { listingHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/grants/")({
  head: () => listingHead({
    title: "Grants & Funding Opportunities for NGOs in India | DevelopmentWala.org",
    description: "Discover grants and funding opportunities for NGOs, social enterprises and changemakers in India. Updated weekly on DevelopmentWala.org.",
    path: "/grants",
    collectionName: "Grants for NGOs in India",
  }),
  component: () => <Grants />,
});
