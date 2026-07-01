// Resource configuration for the public API list/detail endpoints.
// Each entry maps a URL slug to a Supabase table + the columns / filters
// safe to expose over the public JSON API.

export type ResourceKey =
  | "jobs"
  | "internships"
  | "fellowships"
  | "scholarships"
  | "grants"
  | "events";

export type ResourceConfig = {
  table: string;
  publicSelect: string;
  detailSelect: string;
  /** Additional PostgREST-style filters applied to list & detail queries. */
  publicFilters: Array<{ column: string; op: "eq" | "gt" | "lt" | "gte" | "lte"; value: string | number | boolean }>;
  /** Full-text-ish search fields (ilike OR). */
  searchFields: string[];
  /** Columns exposed as `?filter[col]=value` query params on list. */
  filterableColumns: string[];
  /** Detail lookup — `slug` when present, otherwise `id`. */
  detailKey: "slug" | "id";
  /** If `detailKey === 'slug'` but the row also has an id, also accept id. */
  detailFallbackToId: boolean;
};

export const RESOURCES: Record<ResourceKey, ResourceConfig> = {
  jobs: {
    table: "jobs",
    publicSelect:
      "id,slug,title,organization,organization_type,city,state,country,employment_type,role_category,experience_min,salary_currency,salary_value,salary_unit_text,date_posted,valid_through,featured,created_at",
    detailSelect:
      "id,slug,title,description,qualifications,organization,organization_type,city,state,country,employment_type,role_category,experience_min,salary_currency,salary_value,salary_unit_text,how_to_apply,applylink,date_posted,valid_through,featured,education_required,created_at",
    publicFilters: [{ column: "is_active", op: "eq", value: true }],
    searchFields: ["title", "organization", "description"],
    filterableColumns: ["role_category", "employment_type", "city", "state", "country", "organization_type", "featured"],
    detailKey: "slug",
    detailFallbackToId: true,
  },
  internships: {
    table: "internships",
    publicSelect:
      "id,slug,title,org_name,field,internship_type,duration,city,state,country,remote,stipend,deadline,featured,created_at",
    detailSelect:
      "id,slug,title,description,eligibility,application_process,org_name,field,internship_type,duration,city,state,country,remote,stipend,deadline,featured,created_at",
    publicFilters: [{ column: "status", op: "eq", value: "Active" }],
    searchFields: ["title", "org_name", "description"],
    filterableColumns: ["field", "internship_type", "city", "state", "country", "remote", "featured"],
    detailKey: "slug",
    detailFallbackToId: true,
  },
  fellowships: {
    table: "fellowships",
    publicSelect:
      "id,slug,title,org_name,field,fellowship_type,duration,city,state,country,remote,stipend,deadline,featured,created_at",
    detailSelect:
      "id,slug,title,description,eligibility,application_process,org_name,field,fellowship_type,duration,city,state,country,remote,stipend,deadline,featured,created_at",
    publicFilters: [{ column: "status", op: "eq", value: "Active" }],
    searchFields: ["title", "org_name", "description"],
    filterableColumns: ["field", "fellowship_type", "city", "state", "country", "remote", "featured"],
    detailKey: "slug",
    detailFallbackToId: true,
  },
  scholarships: {
    table: "scholarships",
    publicSelect:
      "id,slug,title,org_name,field,level,scholarship_type,city,state,country,amount,deadline,featured,created_at",
    detailSelect:
      "id,slug,title,description,eligibility,application_process,benefits,org_name,field,level,scholarship_type,city,state,country,amount,deadline,featured,created_at",
    publicFilters: [{ column: "status", op: "eq", value: "Active" }],
    searchFields: ["title", "org_name", "description"],
    filterableColumns: ["field", "level", "scholarship_type", "city", "state", "country", "featured"],
    detailKey: "slug",
    detailFallbackToId: true,
  },
  grants: {
    table: "grants",
    publicSelect:
      "id,title,organization,type,sector,amount,deadline,tags,featured,created_at",
    detailSelect:
      "id,title,description,eligible,organization,type,sector,amount,deadline,link,tags,featured,created_at",
    publicFilters: [{ column: "status", op: "eq", value: "Active" }],
    searchFields: ["title", "organization", "description"],
    filterableColumns: ["type", "sector", "featured"],
    detailKey: "id",
    detailFallbackToId: false,
  },
  events: {
    table: "events",
    publicSelect:
      "id,slug,title,organizer,type,mode,location,start_date,end_date,start_time,tags,created_at",
    detailSelect:
      "id,slug,title,description,organizer,type,mode,location,start_date,end_date,start_time,link,tags,created_at",
    publicFilters: [],
    searchFields: ["title", "organizer", "description"],
    filterableColumns: ["type", "mode"],
    detailKey: "slug",
    detailFallbackToId: true,
  },
};
