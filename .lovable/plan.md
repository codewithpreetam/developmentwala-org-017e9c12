# Employer Dashboard & Opportunity Management Overhaul

This is a large body of work. I'll deliver it in 4 sequenced phases so each phase is reviewable, testable, and shippable on its own. After you approve the plan, I'll start with Phase 1 and check in between phases.

---

## Phase 1 — Organization Profile as Single Source of Truth

**Goal:** One `organizations` record per employer. Every opportunity references it instead of duplicating org name/logo/website/etc.

- Schema (single migration):
  - Add `organization_id uuid` to `jobs`, `internships`, `fellowships`, `scholarships`, `grants`, `events` (nullable, FK to `organizations`).
  - Backfill `organization_id` from existing `organization` / `funding_agency` / `organizer_name` text by matching the employer's org row.
  - Add `updated_at` trigger on `organizations` if missing.
  - RLS: employers can update only their own org row; public can read org rows referenced by published listings.
- Employer Dashboard → **Organization Profile** section becomes the single edit surface:
  - Fields: Org Name (editable), Logo, Tagline, About, Website, Industry/Sector, NGO Type, Location, Email, Phone, LinkedIn/Twitter/Facebook/Instagram, Founded year, Size.
  - Logo upload via existing `uploads` bucket (per-user folder).
  - Save updates propagate automatically because listings join on `organization_id`.
- Remove org-name/logo/website fields from posting forms (or make them read-only "Posting as: {Org}" with a link to edit profile).
- Public listing/detail components read org details via the joined `organizations` row (fallback to legacy text fields for un-backfilled rows).

## Phase 2 — Opportunity Posting Experience

**Goal:** Modern, professional, multi-step posting flow shared by all opportunity types.

- New shared component `OpportunityPostingWizard` with stepper:
  1. Basics (type, title, category, tags)
  2. Details (rich-text description, responsibilities, requirements, benefits) — using `@tiptap/react` (lightweight, already viable)
  3. Logistics (location, work mode, employment type, experience level, salary/stipend, deadline, conditional fields per type)
  4. Media & SEO (cover image, slug auto-generated from title with manual override, meta description)
  5. Preview & Publish (renders the exact public detail layout)
- Auto-save drafts to `localStorage` keyed by `draft:{type}:{userId}` every 5s; "Resume draft" banner on revisit.
- Server-side draft persistence: set `status='draft'` on submit-as-draft; "Publish" sets `status='published'`.
- Zod validation per step; inline errors; submit blocked until current step is valid.
- Slug helper: `slugify(title) + short hash`, uniqueness check against the target table.
- Refactor `SubmitJob`, `SubmitInternship`, `SubmitFellowship`, `SubmitScholarship`, `SubmitGrant`, `SubmitEvent`, plus a new `SubmitVolunteering` (maps to existing volunteer category on `jobs`), to use the wizard with type-specific field configs.
- Fully responsive (mobile stepper collapses to accordion).

## Phase 3 — Public Opportunity Detail Pages

**Goal:** Clean, trustworthy, conversion-oriented detail page shared across all types.

- Rewrite `EntityDetailPage.jsx` layout:
  - Breadcrumb (Home › Jobs › {Org} › {Title}).
  - Hero: title, org name + logo (linked to org profile), location, work mode, employment type, posted date, deadline countdown badge.
  - Two-column on desktop: left = Summary, Responsibilities, Requirements, Benefits, Skills (chips), Salary/Stipend; right = sticky Apply card + Org info card + Share buttons + Save/Bookmark.
  - Related opportunities (same org, then same category) at the bottom.
  - Typography pass: larger headings, comfortable line-height, generous spacing, consistent section dividers.
  - Mobile: single column, sticky bottom Apply bar.
- Share buttons (native `navigator.share` + LinkedIn/X/Facebook/WhatsApp/Copy link).
- Apply section: gated CTA (sign-in modal for guests), shows requirement summary before opening application modal.

## Phase 4 — SEO, Sitemap & Structured Data

**Goal:** Indexable, Google-for-Jobs compliant, rich-results-ready.

- Per-route `head()` audit: title, description, canonical (self-referencing leaf only), OG/Twitter tags with hero image when present.
- `src/routes/sitemap[.]xml.tsx`: extend to include orgs, blog, all listing types with `lastmod` from `updated_at`; chunk via sitemap index if >50k URLs.
- `public/robots.txt`: confirm AI crawlers allowed, `Sitemap:` pointing to published URL.
- JSON-LD per page type:
  - Root: `Organization` + `WebSite` (with `SearchAction` pointing to `/jobs?q={query}`).
  - Listing pages: `BreadcrumbList`.
  - Job/Internship/Fellowship detail: `JobPosting` (already partial — complete `hiringOrganization` from org row, `baseSalary`, `employmentType`, `jobLocation`, `directApply`, `validThrough`, `identifier`).
  - Scholarship detail: `EducationalOccupationalProgram` + `Scholarship`-shaped fields.
  - Grant detail: `MonetaryGrant`.
  - Event detail: `Event` (location, offers, organizer = org row).
  - Blog post: `Article` with author `Person`.
  - FAQ blocks (when present in description) → `FAQPage`.
- Validate samples against Google Rich Results Test mentally (required fields filled, types correct).
- Clean URL audit: all detail routes use `/<type>/<slug>`; legacy `?id=` kept as fallback.

---

## Order of Execution

1. Phase 1 migration + Organization Profile UI + reads through `organization_id` (with backfill).
2. Phase 2 wizard, starting with Jobs as the reference implementation, then port other types.
3. Phase 3 detail-page redesign (consumes Phase 1 org data).
4. Phase 4 SEO/JSON-LD sweep (consumes Phase 3 layout and Phase 1 org).

## What I'll Touch (high-level)

- DB: 1 migration (Phase 1).
- New: `OpportunityPostingWizard`, `OrgProfileEditor`, `ApplyCard`, `OrgInfoCard`, `ShareButtons`, `DeadlineCountdown`, `RelatedOpportunities`, JSON-LD builders.
- Modified: all `Submit*.jsx`, `EmployerDashboard.jsx`, `EntityDetailPage.jsx`, all `*Detail.jsx`, `__root.tsx`, `sitemap[.]xml.tsx`, `robots.txt`.

## Out of Scope (unless you ask)

- Multi-user organizations (one employer = one org for now).
- Paid promotion / featured listings beyond what already exists.
- Email notification redesign.

---

**Approve and I'll start Phase 1** (migration + Organization Profile editor + sync wiring). I'll pause after each phase for you to review before moving on.
