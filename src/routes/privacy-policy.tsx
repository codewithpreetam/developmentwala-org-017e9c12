import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

const URL = "https://developmentwala-org.lovable.app/privacy-policy";
const TITLE = "Privacy Policy | DevelopmentWala.org";
const DESC =
  "Learn how DevelopmentWala.org collects, uses, protects, and manages your personal information while using our platform.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESC,
          url: URL,
          inLanguage: "en",
          isPartOf: {
            "@type": "WebSite",
            name: "DevelopmentWala.org",
            url: "https://developmentwala-org.lovable.app",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://developmentwala-org.lovable.app/" },
            { "@type": "ListItem", position: 2, name: "Legal", item: "https://developmentwala-org.lovable.app/legal" },
            { "@type": "ListItem", position: 3, name: "Privacy Policy", item: URL },
          ],
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PrivacyPolicy />;
}
