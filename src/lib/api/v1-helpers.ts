// Shared helpers for the public JSON API under /api/public/v1/*
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey",
  "Access-Control-Max-Age": "86400",
};

export function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
      ...(init.headers || {}),
    },
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function apiError(status: number, message: string, code?: string) {
  return json({ error: { code: code || `HTTP_${status}`, message } }, { status });
}

/** Anonymous (publishable-key) client — respects RLS as `anon`. */
export function publicClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Per-request client bound to the caller's bearer token — respects RLS as that user. */
export function userClient(bearer: string): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
}

export async function requireUser(request: Request): Promise<
  | { ok: true; supabase: SupabaseClient; userId: string; email: string | null }
  | { ok: false; response: Response }
> {
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!bearer) return { ok: false, response: apiError(401, "Missing Bearer token", "UNAUTHORIZED") };
  const supabase = userClient(bearer);
  if (!supabase) return { ok: false, response: apiError(500, "Server not configured", "SERVER_CONFIG") };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, response: apiError(401, "Invalid or expired token", "UNAUTHORIZED") };
  return { ok: true, supabase, userId: data.user.id, email: data.user.email ?? null };
}

export type ListParams = {
  page: number;
  perPage: number;
  from: number;
  to: number;
  q: string | null;
  order: "asc" | "desc";
  orderBy: string;
};

export function parseListParams(request: Request, defaultOrderBy = "created_at"): ListParams {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") || "20", 10) || 20));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const q = url.searchParams.get("q");
  const order = (url.searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const orderBy = url.searchParams.get("order_by") || defaultOrderBy;
  return { page, perPage, from, to, q, order, orderBy };
}

export function pageEnvelope<T>(items: T[], count: number | null, params: ListParams) {
  const total = count ?? items.length;
  return {
    data: items,
    meta: {
      page: params.page,
      per_page: params.perPage,
      total,
      total_pages: Math.max(1, Math.ceil(total / params.perPage)),
    },
  };
}

export function getSearchParam(request: Request, key: string): string | null {
  return new URL(request.url).searchParams.get(key);
}
