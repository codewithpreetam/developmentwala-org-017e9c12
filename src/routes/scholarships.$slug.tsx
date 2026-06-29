import { createFileRoute, notFound } from "@tanstack/react-router";
import ScholarshipDetail from "@/pages/ScholarshipDetail";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { educationalProgramSchema, breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/scholarships/$slug")({
  loader: async ({ params }) => {
    const row = await fetchPublicRow<Record<string, unknown>>(
      "scholarships",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}`,
    );
    if (!row) throw notFound();
    return { row };
  },
  head: ({ params, loaderData }) => {
    const row = loaderData?.row;
    const path = `/scholarships/${params.slug}`;
    const url = absoluteUrl(path);
    if (!row) return {};
    const orgName = row.org_name || row.organization || "NGO";
    const title = `${row.title} | Scholarship by ${orgName} | DevelopmentWala.org`;
    const description = stripHtml(row.description, 160) || `Apply for the ${row.title} scholarship on DevelopmentWala.org.`;
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
        { type: "application/ld+json", children: JSON.stringify(educationalProgramSchema(row, { path, type: "scholarship" })) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Scholarships", path: "/scholarships" },
          { name: String(row.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <ScholarshipDetail />,
});
