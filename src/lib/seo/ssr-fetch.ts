/**
 * Server-side fetch for public Data API rows used to populate per-route
 * head() metadata and JSON-LD. Returns `null` when missing/errored so
 * callers can gracefully degrade to a generic title.
 */
const SUPABASE_URL = "https://ymrzpbpjhmdkjmgqswnw.supabase.co";
const SUPABASE_KEY = "sb_publishable_VTdt_ylPDs1pyN3HgTuQEA_PqFiB34-";

export async function fetchPublicRow<T = Record<string, unknown>>(
  table: string,
  query: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}&limit=1`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as T[];
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

export function stripHtml(s: unknown, max = 160): string {
  if (!s) return "";
  return String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~\\[\\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function absoluteUrl(path: string): string {
  return `https://developmentwala.org${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbList(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
