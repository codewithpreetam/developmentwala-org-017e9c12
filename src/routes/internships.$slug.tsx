import { createFileRoute, notFound } from "@tanstack/react-router";
import InternshipDetail from "@/pages/InternshipDetail";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { jobPostingSchema, breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/internships/$slug")({
  loader: async ({ params }) => {
    const row = await fetchPublicRow<Record<string, unknown>>(
      "internships",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}`,
    );
    if (!row) throw notFound();
    return { row };
  },
  head: ({ params, loaderData }) => {
    const row = loaderData?.row;
    const path = `/internships/${params.slug}`;
    const url = absoluteUrl(path);
    if (!row) return {};
    const orgName = row.org_name || row.organization || "NGO";
    const title = `${row.title} at ${orgName} | Internship | DevelopmentWala.org`;
    const description = stripHtml(row.description, 160) || `Apply for the ${row.title} internship on DevelopmentWala.org.`;
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
        { type: "application/ld+json", children: JSON.stringify(jobPostingSchema(row, { path, opType: "internship" })) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Internships", path: "/internships" },
          { name: String(row.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <InternshipDetail />,
});
