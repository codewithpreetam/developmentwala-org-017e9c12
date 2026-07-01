// Public JSON API dispatcher — /api/public/v1/*
//
// Routes handled here:
//   GET    /api/public/v1                          → API index
//   GET    /api/public/v1/openapi.json             → OpenAPI 3.1 spec
//   GET    /api/public/v1/{resource}               → list
//   GET    /api/public/v1/{resource}/{id-or-slug}  → detail
//   GET    /api/public/v1/me                       → current user (auth)
//   GET    /api/public/v1/me/applications          → my applications (auth)
//   POST   /api/public/v1/applications             → apply to an opportunity (auth)
//
// Auth: `Authorization: Bearer <supabase_access_token>`

import { createFileRoute } from "@tanstack/react-router";
import {
  CORS_HEADERS,
  apiError,
  json,
  pageEnvelope,
  parseListParams,
  preflight,
  publicClient,
  requireUser,
} from "@/lib/api/v1-helpers";
import { RESOURCES, type ResourceKey } from "@/lib/api/v1-resources";
import { buildOpenApiSpec } from "@/lib/api/v1-openapi";

function segments(splat: string | undefined): string[] {
  return (splat || "").split("/").filter(Boolean);
}

function apiIndex(origin: string) {
  const base = `${origin}/api/public/v1`;
  return {
    name: "DevelopmentWala Public API",
    version: "1.0.0",
    documentation: `${origin}/api-docs`,
    openapi: `${base}/openapi.json`,
    resources: {
      jobs: `${base}/jobs`,
      internships: `${base}/internships`,
      fellowships: `${base}/fellowships`,
      scholarships: `${base}/scholarships`,
      grants: `${base}/grants`,
      events: `${base}/events`,
    },
    authenticated: {
      me: `${base}/me`,
      my_applications: `${base}/me/applications`,
      apply: `${base}/applications`,
    },
    auth: {
      scheme: "Bearer",
      description:
        "Use a Supabase access token from your account. Obtain it via the site sign-in flow and pass it as `Authorization: Bearer <token>`.",
    },
  };
}

async function handleList(resourceKey: ResourceKey, request: Request) {
  const supabase = publicClient();
  if (!supabase) return apiError(500, "Server not configured", "SERVER_CONFIG");

  const cfg = RESOURCES[resourceKey];
  const params = parseListParams(request);
  const url = new URL(request.url);

  let query = supabase.from(cfg.table).select(cfg.publicSelect, { count: "exact" });

  for (const f of cfg.publicFilters) {
    // @ts-expect-error dynamic op is safe: constrained union in ResourceConfig
    query = query[f.op](f.column, f.value);
  }

  // Per-column filters via ?filter[col]=value
  for (const col of cfg.filterableColumns) {
    const value = url.searchParams.get(`filter[${col}]`) ?? url.searchParams.get(col);
    if (value != null && value !== "") {
      if (value === "true" || value === "false") {
        query = query.eq(col, value === "true");
      } else {
        query = query.eq(col, value);
      }
    }
  }

  if (params.q && cfg.searchFields.length) {
    const like = `%${params.q.replace(/[%_]/g, "")}%`;
    const orExpr = cfg.searchFields.map((f) => `${f}.ilike.${like}`).join(",");
    query = query.or(orExpr);
  }

  query = query.order(params.orderBy, { ascending: params.order === "asc" }).range(params.from, params.to);

  const { data, error, count } = await query;
  if (error) return apiError(400, error.message, "QUERY_FAILED");
  return json(pageEnvelope(data || [], count, params));
}

async function handleDetail(resourceKey: ResourceKey, keyValue: string) {
  const supabase = publicClient();
  if (!supabase) return apiError(500, "Server not configured", "SERVER_CONFIG");

  const cfg = RESOURCES[resourceKey];
  let query = supabase.from(cfg.table).select(cfg.detailSelect).limit(1);
  for (const f of cfg.publicFilters) {
    // @ts-expect-error dynamic op is safe: constrained union in ResourceConfig
    query = query[f.op](f.column, f.value);
  }

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const looksLikeId = uuidRe.test(keyValue);

  if (cfg.detailKey === "slug") {
    if (looksLikeId && cfg.detailFallbackToId) {
      query = query.or(`slug.eq.${keyValue},id.eq.${keyValue}`);
    } else {
      query = query.eq("slug", keyValue);
    }
  } else {
    query = query.eq("id", keyValue);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return apiError(400, error.message, "QUERY_FAILED");
  if (!data) return apiError(404, "Not found", "NOT_FOUND");
  return json({ data });
}

async function handleMe(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase
    .from("users")
    .select("id,email,first_name,last_name,role,profile_image,created_at")
    .eq("id", auth.userId)
    .maybeSingle();
  if (error) return apiError(400, error.message, "QUERY_FAILED");
  return json({ data: data || { id: auth.userId, email: auth.email } });
}

async function handleMyApplications(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const params = parseListParams(request);
  const { data, error, count } = await auth.supabase
    .from("applications")
    .select("*", { count: "exact" })
    .eq("candidate_id", auth.userId)
    .order(params.orderBy, { ascending: params.order === "asc" })
    .range(params.from, params.to);
  if (error) return apiError(400, error.message, "QUERY_FAILED");
  return json(pageEnvelope(data || [], count, params));
}

async function handleCreateApplication(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body", "INVALID_JSON");
  }

  const opportunity_id = String(body.opportunity_id || "").trim();
  const opportunity_type = String(body.opportunity_type || "").trim().toLowerCase();
  const cover_letter = body.cover_letter ? String(body.cover_letter) : null;
  const cv_url = body.cv_url ? String(body.cv_url) : null;

  const allowedTypes = ["job", "internship", "fellowship", "scholarship", "grant", "event"];
  if (!opportunity_id) return apiError(422, "opportunity_id is required", "VALIDATION");
  if (!allowedTypes.includes(opportunity_type))
    return apiError(422, `opportunity_type must be one of: ${allowedTypes.join(", ")}`, "VALIDATION");

  const { data, error } = await auth.supabase
    .from("applications")
    .insert({
      candidate_id: auth.userId,
      opportunity_id,
      opportunity_type,
      cover_letter,
      cv_url,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return apiError(400, error.message, "INSERT_FAILED");
  return json({ data }, { status: 201 });
}

export const Route = createFileRoute("/api/public/v1/$")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request, params }) => {
        const parts = segments((params as { _splat?: string })._splat);
        if (parts[0] === "applications" && parts.length === 1) {
          return handleCreateApplication(request);
        }
        return new Response(null, { status: 405, headers: { ...CORS_HEADERS, Allow: "GET, OPTIONS" } });
      },
      GET: async ({ request, params }) => {
        const parts = segments((params as { _splat?: string })._splat);
        const origin = new URL(request.url).origin;

        if (parts.length === 0) return json(apiIndex(origin));
        if (parts[0] === "openapi.json" && parts.length === 1) {
          return json(buildOpenApiSpec(origin));
        }
        if (parts[0] === "me") {
          if (parts.length === 1) return handleMe(request);
          if (parts[1] === "applications" && parts.length === 2) return handleMyApplications(request);
          return apiError(404, "Unknown endpoint", "NOT_FOUND");
        }

        const [resource, keyValue, extra] = parts;
        if (!(resource in RESOURCES)) return apiError(404, `Unknown resource: ${resource}`, "NOT_FOUND");
        if (extra) return apiError(404, "Unknown endpoint", "NOT_FOUND");

        if (!keyValue) return handleList(resource as ResourceKey, request);
        return handleDetail(resource as ResourceKey, keyValue);
      },
    },
  },
});
