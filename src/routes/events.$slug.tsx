import { createFileRoute, notFound } from "@tanstack/react-router";
import EventDetail from "@/pages/EventDetail";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { eventSchema, breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const row = await fetchPublicRow<Record<string, unknown>>(
      "events",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}`,
    );
    if (!row) throw notFound();
    return { row };
  },
  head: ({ params, loaderData }) => {
    const row = loaderData?.row;
    const path = `/events/${params.slug}`;
    const url = absoluteUrl(path);
    if (!row) return {};
    const orgName = row.organizer || "DevelopmentWala.org";
    const title = `${row.title} | Event by ${orgName} | DevelopmentWala.org`;
    const description = stripHtml(row.description, 160);
    const image = (row.poster_url as string) || undefined;
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
        { type: "application/ld+json", children: JSON.stringify(eventSchema(row, { path })) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: String(row.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <EventDetail />,
});
