import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "Developer API — DevelopmentWala" },
      {
        name: "description",
        content:
          "Public REST API for DevelopmentWala.org — build apps and integrations on top of jobs, internships, fellowships, scholarships, grants and events.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: ApiDocsPage,
});

const BASE = "/api/public/v1";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({
  method,
  path,
  auth,
  desc,
}: {
  method: string;
  path: string;
  auth?: boolean;
  desc: string;
}) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-800",
    POST: "bg-sky-100 text-sky-800",
    PATCH: "bg-amber-100 text-amber-800",
    DELETE: "bg-rose-100 text-rose-800",
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-200 py-3">
      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${colors[method] || "bg-slate-100"}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-slate-800 break-all">{path}</code>
      {auth && (
        <span className="inline-block px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded">Auth required</span>
      )}
      <span className="text-sm text-slate-600 sm:ml-2">{desc}</span>
    </div>
  );
}

function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Developers</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">DevelopmentWala Public API</h1>
          <p className="text-slate-600 mt-3">
            A versioned JSON REST API for building mobile apps, dashboards, and integrations on top of
            DevelopmentWala.org data. Same-origin, CORS-enabled, backed by row-level security.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Base URL</h2>
          <Code>{`https://developmentwala.org${BASE}`}</Code>
          <p className="text-slate-600 mt-3">
            Machine-readable spec:{" "}
            <a className="text-emerald-700 underline" href={`${BASE}/openapi.json`}>
              /api/public/v1/openapi.json
            </a>{" "}
            (OpenAPI 3.1 — drop it into Swagger UI, Redoc, Postman or your codegen).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Authentication</h2>
          <p className="text-slate-600 mb-3">
            Public read endpoints need no credentials. For endpoints marked <em>Auth required</em>, pass a Supabase
            access token as a bearer token:
          </p>
          <Code>{`Authorization: Bearer <access_token>`}</Code>
          <p className="text-slate-600 mt-3">
            You get an access token by signing in through the site or by calling Supabase Auth directly with the
            publishable key exposed in your app. Tokens expire — refresh them client-side with the Supabase SDK.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Public endpoints</h2>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <Endpoint method="GET" path={`${BASE}`} desc="API index & resource map" />
            <Endpoint method="GET" path={`${BASE}/openapi.json`} desc="OpenAPI 3.1 specification" />
            <Endpoint method="GET" path={`${BASE}/jobs`} desc="List active jobs" />
            <Endpoint method="GET" path={`${BASE}/jobs/{slug}`} desc="Get one job by slug or id" />
            <Endpoint method="GET" path={`${BASE}/internships`} desc="List active internships" />
            <Endpoint method="GET" path={`${BASE}/internships/{slug}`} desc="Get one internship" />
            <Endpoint method="GET" path={`${BASE}/fellowships`} desc="List active fellowships" />
            <Endpoint method="GET" path={`${BASE}/fellowships/{slug}`} desc="Get one fellowship" />
            <Endpoint method="GET" path={`${BASE}/scholarships`} desc="List active scholarships" />
            <Endpoint method="GET" path={`${BASE}/scholarships/{slug}`} desc="Get one scholarship" />
            <Endpoint method="GET" path={`${BASE}/grants`} desc="List active grants" />
            <Endpoint method="GET" path={`${BASE}/grants/{id}`} desc="Get one grant by id" />
            <Endpoint method="GET" path={`${BASE}/events`} desc="List events" />
            <Endpoint method="GET" path={`${BASE}/events/{slug}`} desc="Get one event" />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Authenticated endpoints</h2>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <Endpoint method="GET" path={`${BASE}/me`} auth desc="Current user profile" />
            <Endpoint method="GET" path={`${BASE}/me/applications`} auth desc="List my applications" />
            <Endpoint method="POST" path={`${BASE}/applications`} auth desc="Submit an application" />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Query parameters (list endpoints)</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>
              <code>page</code> — page number (default 1)
            </li>
            <li>
              <code>per_page</code> — page size, 1–100 (default 20)
            </li>
            <li>
              <code>q</code> — free-text search across title, organization &amp; description
            </li>
            <li>
              <code>order_by</code> / <code>order</code> — sort column and direction (default{" "}
              <code>created_at desc</code>)
            </li>
            <li>
              <code>filter[column]=value</code> — equality filter on any whitelisted column (e.g.{" "}
              <code>filter[city]=Delhi</code>, <code>filter[featured]=true</code>)
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Example: list jobs in Delhi</h2>
          <Code>{`curl "https://developmentwala.org${BASE}/jobs?filter[city]=Delhi&per_page=10"`}</Code>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Example: submit an application</h2>
          <Code>{`curl -X POST https://developmentwala.org${BASE}/applications \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "opportunity_id": "e3b0c442-...-...-...-000000000000",
    "opportunity_type": "job",
    "cover_letter": "I am excited to apply..."
  }'`}</Code>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Response envelope</h2>
          <p className="text-slate-600 mb-3">List endpoints return:</p>
          <Code>{`{
  "data": [ { ... }, { ... } ],
  "meta": { "page": 1, "per_page": 20, "total": 137, "total_pages": 7 }
}`}</Code>
          <p className="text-slate-600 mt-3">Detail endpoints return:</p>
          <Code>{`{ "data": { ... } }`}</Code>
          <p className="text-slate-600 mt-3">Errors return:</p>
          <Code>{`{ "error": { "code": "UNAUTHORIZED", "message": "Missing Bearer token" } }`}</Code>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Rate limits &amp; caching</h2>
          <p className="text-slate-600">
            No hard rate limit at present — please be reasonable. Cache list responses on your side for at least a
            minute; opportunity data updates frequently but not per-second.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Building a mobile / web app</h2>
          <p className="text-slate-600">
            The fastest path is the Supabase JS/Swift/Kotlin SDK with the publishable key for auth + realtime, and this
            REST API for read/write on the domain endpoints. That gives you sign-in, session refresh, storage uploads
            and this API's shape out of the box.
          </p>
        </section>

        <p className="text-sm text-slate-500">Version 1.0.0 · Contact us if you need additional endpoints.</p>
      </main>
      <Footer />
    </div>
  );
}
