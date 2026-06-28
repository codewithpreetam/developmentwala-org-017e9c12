Port the uploaded DevelopmentWala non-profit job board project into the current Lovable project while preserving Lovable's TanStack Start infrastructure so the project remains openable and previewable.

Steps

1. Inspect the uploaded zip and list all files to understand the full project surface.
2. Copy all non-generated files from the uploaded project into `/dev-server/`.
3. Explicitly exclude:
   - `.git/` (preserve the current Lovable git state)
   - `node_modules/` and `dist/` (can be regenerated)
   - `package-lock.json` (current project uses `bun.lock`)
   - `.github/` (keep current Lovable CI/settings)
   - `__MACOSX/` and `.DS_Store` (macOS metadata)
4. Preserve current Lovable/TanStack Start root files so the app still bootstraps:
   - `src/router.tsx`
   - `src/routes/__root.tsx`
   - `src/routes/index.tsx`
   - `src/styles.css`
   - `vite.config.ts`
   - `tsconfig.json`
   - `bun.lock`
5. For root-level files that conflict with the Lovable setup, keep the uploaded version alongside the current one with a clear suffix or in a subfolder so nothing is lost:
   - `index.html` → `uploaded-index.html` (TanStack Start uses `__root.tsx` as the shell)
   - `tailwind.config.js` → `uploaded-tailwind.config.js` (current uses Tailwind v4 CSS-based config)
   - `postcss.config.js` → `uploaded-postcss.config.js`
   - `jsconfig.json` → `uploaded-jsconfig.json`
6. Merge `package.json` dependencies: add all uploaded dependencies/devDependencies that are not already present, then install with `bun install`.
7. Copy the uploaded source tree as-is into `src/` (pages, components, hooks, lib, utils, styles). Components already live in `src/components/ui/`; the uploaded JSX components will overwrite or coexist with the current TSX components. Because this is a port of the existing app, this is expected.
8. Copy supporting files:
   - `public/`
   - `server/`
   - `supabase/`
   - `scripts/`
   - `NGO.sql`, `supabase/schema-extensions.sql`, `supabase/auth-password-reset.sql`, `supabase/setup-storage.sql`, `supabase/setup-api.sql`, `supabase/seed-demo-users.sql`
   - `ARCHITECTURE.md`, `GUIDE.md`, `DevelopmentWala_Complete_Developer_Guide.md`, `README.md`
9. After copying, run a quick verification to confirm the directory structure is present and the Lovable dev server still starts (no unresolved imports in the TanStack Start shell).
10. Note for the user: the uploaded project uses React Router + Vite SPA routing; the next step will be to wire the uploaded pages into TanStack Start routes (`src/routes/`) and replace/supabase config to use Lovable Cloud.

What you will see after this step

- All DevelopmentWala files copied into the project
- Preserved Lovable bootstrap files so the project opens and previews
- Merged dependencies installed
- A list of the top-level conflicts that were handled by suffixing rather than overwriting