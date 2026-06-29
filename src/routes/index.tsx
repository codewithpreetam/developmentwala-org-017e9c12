import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";
import { absoluteUrl } from "@/lib/seo/ssr-fetch";

const TITLE = "DevelopmentWala.org — NGO Jobs, Internships, Fellowships, Scholarships & Grants in India";
const DESC = "India's largest curated platform for NGO and social sector careers. Discover jobs, internships, fellowships, scholarships, grants and events from leading impact organisations.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: () => <Home />,
});
