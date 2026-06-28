Wire all uploaded pages into TanStack Start routes and provide a React Router-compatible adapter so the existing components keep working while the app switches to TanStack file-based routing.

The uploaded project (src/pages/ and src/components/) still uses react-router-dom imports and paths. The current repo is a TanStack Start project, so every page needs a route file under src/routes/ and the navigation imports must be redirected to TanStack equivalents.

Plan:
1. Create src/lib/router-adapter.tsx
   - Re-export Link, useParams, useSearchParams, useNavigate, useLocation using @tanstack/react-router.
   - Keep the most common React Router call signatures working (string/object to, params.slug, searchParams.get('id'), navigate('/path'), navigate(-1), location.pathname).

2. Update root layout in src/routes/__root.tsx
   - Keep QueryClientProvider and <Outlet />.
   - Add AdminAuthProvider and AuthProvider from src/Layout.jsx and include the signup popup logic.
   - Add proper head metadata and notFound/error boundaries.

3. Replace src/routes/index.tsx placeholder
   - Render the uploaded Home page with the shared navbar/footer.

4. Create route files under src/routes/ for all uploaded pages
   - Map old React Router paths to TanStack conventions:
     /Jobs -> /jobs, /SignIn -> /sign-in, /jobs/:slug -> /jobs/$slug, etc.
   - Cover all pages from src/pages.config.js and the extra routes in src/App.jsx (detail pages, auth, blog, legal, submit, etc.).
   - Detail routes pass params to the page components or wrap them so they read slug/id correctly.

5. Replace react-router-dom imports
   - In src/pages/*.jsx and src/components/**/*.jsx, change imports from 'react-router-dom' to '@/lib/router-adapter'.
   - Update navigation helpers (e.g., src/utils/createPageUrl) to output the new route paths.

6. Verify the app builds and the dev server serves the routes
   - Run the dev server or typecheck and fix any runtime errors.
   - Keep the existing visual design and business logic; only routing changes.

Technical details:
- TanStack route filenames use dots for slashes (e.g., jobs.$slug.tsx -> /jobs/$slug).
- Use createFileRoute from @tanstack/react-router.
- The routeTree.gen.ts will be regenerated automatically by the Vite plugin.