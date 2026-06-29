import { createFileRoute } from "@tanstack/react-router";
import Pricing from "@/pages/Pricing";
import { staticHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/pricing")({
  head: () => staticHead({
    title: "Pricing for Employers — Post NGO Jobs on DevelopmentWala.org",
    description: "Transparent pricing plans for NGOs, foundations and social enterprises to post jobs, internships and fellowships on DevelopmentWala.org.",
    path: "/pricing",
  }),
  component: () => <Pricing />,
});
