import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://developmentwala.org";

type Row = Record<string, any>;

async function fetchRows(table: string, select: string, filter: string): Promise<Row[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/${table}?select=${select}&${filter}&order=created_at.desc&limit=50`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as Row[];
  } catch {
    return [];
  }
}

function esc(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(s: any) {
  return String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
}

function rssItem(opts: {
  title: string;
  link: string;
  description: string;
  category: string;
  pubDate: string;
  guid: string;
  image?: string;
  organization?: string;
}) {
  return `<item>
<title>${esc(opts.title)}</title>
<link>${esc(opts.link)}</link>
<guid isPermaLink="false">${esc(opts.guid)}</guid>
<category>${esc(opts.category)}</category>
${opts.organization ? `<dc:creator>${esc(opts.organization)}</dc:creator>` : ""}
<pubDate>${new Date(opts.pubDate).toUTCString()}</pubDate>
<description>${esc(opts.description)}</description>
${opts.image ? `<enclosure url="${esc(opts.image)}" type="image/jpeg" />` : ""}
</item>`;
}

export const Route = createFileRoute("/api/public/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Pull recent published items (last ~30 days) across categories
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sinceFilter = `created_at=gte.${since}`;

        const [jobs, internships, fellowships, scholarships, grants, events, posts] =
          await Promise.all([
            fetchRows(
              "jobs",
              "id,title,slug,description,organization,created_at,is_active",
              `is_active=eq.true&${sinceFilter}`,
            ),
            fetchRows(
              "internships",
              "id,title,slug,description,org_name,created_at,status",
              `status=eq.published&${sinceFilter}`,
            ),
            fetchRows(
              "fellowships",
              "id,title,slug,description,org_name,created_at,status",
              `status=eq.published&${sinceFilter}`,
            ),
            fetchRows(
              "scholarships",
              "id,title,slug,description,org_name,created_at,status",
              `status=eq.published&${sinceFilter}`,
            ),
            fetchRows(
              "grants",
              "id,title,description,organization,created_at,status",
              `status=eq.published&${sinceFilter}`,
            ),
            fetchRows(
              "events",
              "id,title,slug,description,organizer,start_date,created_at",
              `${sinceFilter}`,
            ),
            fetchRows(
              "blog_posts",
              "id,title,slug,excerpt,content,featured_image,author_name,created_at,status",
              `status=eq.published&${sinceFilter}`,
            ),
          ]);

        const items: string[] = [];

        for (const r of jobs) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/jobs/${r.slug || r.id}`,
              description: stripHtml(r.description),
              category: "NGO Jobs",
              pubDate: r.created_at,
              guid: `job-${r.id}`,
              organization: r.organization,
            }),
          );
        }
        for (const r of internships) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/internships/${r.slug || r.id}`,
              description: stripHtml(r.description),
              category: "Internships",
              pubDate: r.created_at,
              guid: `internship-${r.id}`,
              organization: r.org_name,
            }),
          );
        }
        for (const r of fellowships) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/fellowships/${r.slug || r.id}`,
              description: stripHtml(r.description),
              category: "Fellowships",
              pubDate: r.created_at,
              guid: `fellowship-${r.id}`,
              organization: r.org_name,
            }),
          );
        }
        for (const r of scholarships) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/scholarships/${r.slug || r.id}`,
              description: stripHtml(r.description),
              category: "Scholarships",
              pubDate: r.created_at,
              guid: `scholarship-${r.id}`,
              organization: r.org_name,
            }),
          );
        }
        for (const r of grants) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/grants/${r.id}`,
              description: stripHtml(r.description),
              category: "Grants & Funding",
              pubDate: r.created_at,
              guid: `grant-${r.id}`,
              organization: r.organization,
            }),
          );
        }
        for (const r of events) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/events/${r.slug || r.id}`,
              description: stripHtml(r.description),
              category: "Events",
              pubDate: r.created_at,
              guid: `event-${r.id}`,
              organization: r.organizer,
            }),
          );
        }
        for (const r of posts) {
          items.push(
            rssItem({
              title: r.title,
              link: `${SITE}/blog/${r.slug || r.id}`,
              description: stripHtml(r.excerpt || r.content),
              category: "Blogs & Articles",
              pubDate: r.created_at,
              guid: `post-${r.id}`,
              organization: r.author_name,
              image: r.featured_image,
            }),
          );
        }

        // Sort newest first
        items.sort((a, b) => {
          const da = new Date(a.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] || 0).getTime();
          const db = new Date(b.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] || 0).getTime();
          return db - da;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>DevelopmentWala.org — Latest Opportunities</title>
<link>${SITE}</link>
<atom:link href="${SITE}/api/public/rss.xml" rel="self" type="application/rss+xml" />
<description>Latest NGO jobs, internships, fellowships, scholarships, grants, events and articles from DevelopmentWala.org</description>
<language>en-IN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
</channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=900, s-maxage=900",
          },
        });
      },
    },
  },
});
