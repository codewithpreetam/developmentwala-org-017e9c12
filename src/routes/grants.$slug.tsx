import { createFileRoute, notFound } from "@tanstack/react-router";
import GrantDetail from "@/pages/GrantDetail";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/grants/$slug")({
  loader: async ({ params }) => {
    const row = await fetchPublicRow<Record<string, unknown>>(
      "grants",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}`,
    );
    if (!row) throw notFound();
    return { row };
  },
  head: ({ params, loaderData }) => {
    const row = loaderData?.row;
    const path = `/grants/${params.slug}`;
    const url = absoluteUrl(path);
    if (!row) return {};
    const orgName = row.organization || "NGO";
    const title = `${row.title} | Grant by ${orgName} | DevelopmentWala.org`;
    const description = stripHtml(row.description, 160);
    const grantSchema = {
      "@context": "https://schema.org",
      "@type": "Grant",
      name: row.title,
      description,
      url,
      funder: { "@type": "Organization", name: orgName, sameAs: "https://developmentwala.org" },
      amount: row.amount ? {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: String(row.amount).replace(/[^\d.]/g, "") || undefined,
      } : undefined,
      sponsor: { "@type": "Organization", name: orgName },
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(grantSchema) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Grants", path: "/grants" },
          { name: String(row.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <GrantDetail />,
});
