import { createFileRoute, notFound } from "@tanstack/react-router";
import JobDetail from "@/pages/JobDetail";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { jobPostingSchema, breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const job = await fetchPublicRow<Record<string, unknown>>(
      "jobs",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}&is_active=eq.true`,
    );
    if (!job) throw notFound();
    return { job };
  },
  head: ({ params, loaderData }) => {
    const job = loaderData?.job;
    const path = `/jobs/${params.slug}`;
    const url = absoluteUrl(path);
    if (!job) return {};
    const title = `${job.title} at ${job.organization || "NGO"} | DevelopmentWala.org`;
    const description = stripHtml(job.description, 160) || `Apply for ${job.title} on DevelopmentWala.org — India's NGO and social sector careers platform.`;
    const image = (job.organization_logo as string) || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [
          { property: "og:image", content: image },
          { name: "twitter:image", content: image },
        ] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(jobPostingSchema(job, { path, opType: "job" })) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Jobs", path: "/jobs" },
          { name: String(job.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <JobDetail />,
});
