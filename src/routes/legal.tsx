import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";
import { staticHead } from "@/lib/seo/listing-head";

export const Route = createFileRoute("/legal")({
  head: () => staticHead({
    title: "Legal Information & Policies | DevelopmentWala.org",
    description: "Find DevelopmentWala.org's legal information, privacy policy, terms of use, disclaimers and policies in one place.",
    path: "/legal",
  }),
  component: () => <Legal />,
});
