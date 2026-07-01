// OpenAPI 3.1 spec for the DevelopmentWala Public API v1.
// Kept minimal but complete enough for Swagger UI / Redoc / codegen.

export function buildOpenApiSpec(origin: string) {
  const server = `${origin}/api/public/v1`;
  const listParams = [
    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
    { name: "per_page", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
    { name: "q", in: "query", schema: { type: "string" }, description: "Free-text search" },
    { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
    { name: "order_by", in: "query", schema: { type: "string", default: "created_at" } },
  ];

  const listResponse = {
    "200": {
      description: "Paginated list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: { type: "array", items: { type: "object" } },
              meta: {
                type: "object",
                properties: {
                  page: { type: "integer" },
                  per_page: { type: "integer" },
                  total: { type: "integer" },
                  total_pages: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  };

  const detailResponse = {
    "200": {
      description: "Single record",
      content: { "application/json": { schema: { type: "object", properties: { data: { type: "object" } } } } },
    },
    "404": { description: "Not found" },
  };

  const resource = (name: string, keyName: string) => ({
    [`/${name}`]: {
      get: {
        tags: [name],
        summary: `List ${name}`,
        parameters: listParams,
        responses: listResponse,
      },
    },
    [`/${name}/{${keyName}}`]: {
      get: {
        tags: [name],
        summary: `Get one ${name.replace(/s$/, "")}`,
        parameters: [{ name: keyName, in: "path", required: true, schema: { type: "string" } }],
        responses: detailResponse,
      },
    },
  });

  return {
    openapi: "3.1.0",
    info: {
      title: "DevelopmentWala Public API",
      version: "1.0.0",
      description:
        "Read-only access to public opportunities (jobs, internships, fellowships, scholarships, grants, events) and authenticated access to the current user's profile & applications. Use a Supabase access token as `Authorization: Bearer <token>`.",
      contact: { name: "DevelopmentWala", url: "https://developmentwala.org/contact" },
      license: { name: "Proprietary" },
    },
    servers: [{ url: server }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      "/": { get: { summary: "API index", responses: { "200": { description: "OK" } } } },
      ...resource("jobs", "slug"),
      ...resource("internships", "slug"),
      ...resource("fellowships", "slug"),
      ...resource("scholarships", "slug"),
      ...resource("grants", "id"),
      ...resource("events", "slug"),
      "/me": {
        get: {
          tags: ["me"],
          summary: "Current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
        },
      },
      "/me/applications": {
        get: {
          tags: ["me"],
          summary: "List my applications",
          security: [{ bearerAuth: [] }],
          parameters: listParams,
          responses: listResponse,
        },
      },
      "/applications": {
        post: {
          tags: ["applications"],
          summary: "Submit an application",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["opportunity_id", "opportunity_type"],
                  properties: {
                    opportunity_id: { type: "string" },
                    opportunity_type: {
                      type: "string",
                      enum: ["job", "internship", "fellowship", "scholarship", "grant", "event"],
                    },
                    cover_letter: { type: "string" },
                    cv_url: { type: "string", format: "uri" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "401": { description: "Unauthorized" },
            "422": { description: "Validation error" },
          },
        },
      },
    },
  } as const;
}
