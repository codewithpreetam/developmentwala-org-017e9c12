import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://developmentwala.org";

const STATIC_ROUTES = [
  "/", "/jobs", "/internships", "/fellowships", "/scholarships",
  "/grants", "/events", "/employers", "/blog", "/pricing", "/contact",
  "/privacy-policy", "/terms-of-use", "/legal",
];

async function fetchTable(table: string, extraQuery = ""): Promise<Array<{ slug?: string; id: string | number; updated_at?: string; created_at?: string }>> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const qs = `select=id,slug,updated_at,created_at&limit=5000${extraQuery ? `&${extraQuery}` : ""}`;
    const res = await fetch(
      `${url}/rest/v1/${table}?${qs}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}


function urlEntry(loc: string, lastmod?: string, changefreq = "daily", priority = "0.7") {
  return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [jobs, internships, fellowships, scholarships, grants, events, blogPosts, blogCategories] = await Promise.all([
          fetchTable("jobs", "is_active=eq.true"),
          fetchTable("internships", "status=eq.Active"),
          fetchTable("fellowships", "status=eq.Active"),
          fetchTable("scholarships", "status=eq.Active"),
          fetchTable("grants", "status=eq.Published"),
          fetchTable("events"),
          fetchTable("blog_posts", "status=eq.published"),
          fetchTable("blog_categories"),
        ]);

        const parts: string[] = [];
        parts.push('<?xml version="1.0" encoding="UTF-8"?>');
        parts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

        for (const path of STATIC_ROUTES) {
          parts.push(urlEntry(`${SITE}${path}`, undefined, "daily", path === "/" ? "1.0" : "0.8"));
        }

        const sections: Array<[string, typeof jobs]> = [
          ["jobs", jobs],
          ["internships", internships],
          ["fellowships", fellowships],
          ["scholarships", scholarships],
          ["grants", grants],
          ["events", events],
          ["blog", blogPosts],
          ["blog/category", blogCategories],
        ];
        for (const [seg, rows] of sections) {
          for (const row of rows) {
            const slug = row.slug || String(row.id);
            parts.push(urlEntry(`${SITE}/${seg}/${slug}`, row.updated_at || row.created_at, "daily", "0.9"));
          }
        }


        parts.push("</urlset>");
        return new Response(parts.join(""), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
