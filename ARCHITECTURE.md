# DevelopmentWala Architecture Decision

## Stack Choice (GUIDE.md Section 20)

**Decision: Evolve the existing Vite + React SPA with Supabase Postgres** rather than a greenfield Next.js rebuild.

### Rationale

- Phase 1–4 UI is largely complete in `src/` (listings, dashboards, admin moderation).
- Supabase integration is already in progress (`src/lib/supabase/`, `NGO.sql`, `supabase/setup-api.sql`).
- A Next.js migration would duplicate months of UI work without immediate user value.
- GUIDE.md quality requirements (security, RLS, scalability) are met incrementally on the current stack.

### Current Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 6, React 18, React Router 6, Tailwind, TanStack Query |
| Database | Supabase-hosted PostgreSQL (`NGO.sql` + `supabase/schema-extensions.sql`) |
| Auth | Custom RPC (`login_user`, `register_user`) + session in `localStorage` |
| Storage | Supabase Storage (`uploads` bucket) |
| Email | Resend via `scripts/process-email-queue.mjs` (queue in `email_queue` table) |
| Payments | Stripe (client SDK + `scripts/create-checkout.mjs` for server-side sessions) |

### Mapping from GUIDE.md

| GUIDE.md spec | Implementation |
|---------------|----------------|
| Next.js App Router | Vite SPA (deferred; SEO via `SEOHead` + slug routes) |
| Prisma | Direct Supabase client + SQL migrations |
| Auth.js | Custom auth RPCs + email verification tokens |
| Cloudinary/S3 | Supabase Storage |
| Resend | Email queue processor script |
| Stripe | Checkout session script + pricing page |

### Database Setup

```bash
npm run db:setup          # API grants + auth RPCs
npm run db:migrate        # schema extensions (new tables, columns)
npm run db:import         # optional: seed NGO.sql
npm run db:seed-demo      # demo users
```

### Email & Cron

```bash
npm run email:process     # drain email_queue via Resend
npm run alerts:weekly     # weekly opportunity digest
```
