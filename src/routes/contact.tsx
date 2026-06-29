import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/pages/Contact";

const TITLE = "Contact Us — DevelopmentWala.org | India's Social Sector Platform";
const DESCRIPTION = "Connect with DevelopmentWala.org for NGO jobs, internships, fellowships, partnerships, advertising, and social sector collaborations across India.";
const URL = "https://developmentwala.org/contact";

export const Route = createFileRoute("/contact")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
});

function RouteComponent() {
  return <Contact />;
}
