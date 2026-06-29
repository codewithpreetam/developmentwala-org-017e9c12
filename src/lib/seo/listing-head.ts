import { absoluteUrl } from "./ssr-fetch";

export type ListingMeta = {
  title: string;
  description: string;
  path: string;
  collectionName: string;
};

export function listingHead({ title, description, path, collectionName }: ListingMeta) {
  const url = absoluteUrl(path);
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collectionName,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "DevelopmentWala.org", url: "https://developmentwala.org" },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://developmentwala.org/" },
      { "@type": "ListItem", position: 2, name: collectionName, item: url },
    ],
  };
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(collectionLd) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbs) },
    ],
  };
}

export function staticHead({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
