import { createFileRoute, notFound } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { fetchPublicRow, absoluteUrl, stripHtml } from "@/lib/seo/ssr-fetch";
import { articleSchema, breadcrumbList } from "@/lib/seo/schema-builders";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const row = await fetchPublicRow<Record<string, unknown>>(
      "blog_posts",
      `select=*&slug=eq.${encodeURIComponent(params.slug)}&status=eq.published`,
    );
    if (!row) throw notFound();
    return { row };
  },
  head: ({ params, loaderData }) => {
    const row = loaderData?.row;
    const path = `/blog/${params.slug}`;
    const url = absoluteUrl(path);
    if (!row) return {};
    const title = (row.meta_title as string) || `${row.title} | DevelopmentWala.org Blog`;
    const description = stripHtml(row.meta_description || row.excerpt || row.title, 160);
    const image = (row.featured_image as string) || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: String(row.created_at || "") },
        { property: "article:modified_time", content: String(row.updated_at || row.created_at || "") },
        { property: "article:author", content: String(row.author_name || "DevelopmentWala Editorial") },
        ...(image ? [
          { property: "og:image", content: image },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { name: "twitter:image", content: image },
        ] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleSchema(row, { path })) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: String(row.title || params.slug), path },
        ])) },
      ],
    };
  },
  component: () => <BlogPost />,
});
