import { createFileRoute } from "@tanstack/react-router";
import TermsOfUse from "@/pages/TermsOfUse";

const URL = "https://developmentwala-org.lovable.app/terms-of-use";
const TITLE = "Terms & Conditions and Disclaimer | DevelopmentWala.org";
const DESC =
  "Read the Terms & Conditions and Disclaimer governing the use of DevelopmentWala.org — India's career and recruitment platform for the nonprofit and social impact sectors.";

export const Route = createFileRoute("/terms-of-use")({
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
            { "@type": "ListItem", position: 2, name: "Terms & Conditions", item: URL },
          ],
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <TermsOfUse />;
}
