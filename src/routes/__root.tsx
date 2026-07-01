import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { AuthProvider } from "../components/auth/AuthContext";
import { AdminAuthProvider } from "../components/admin/AdminAuth";
import MobileBottomNav from "../components/MobileBottomNav";
import SignupPopup from "../components/shared/SignupPopup";
import ScrollToTop from "../components/ScrollToTop";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://developmentwala.org";
const SITE_TITLE = "DevelopmentWala.org — NGO & Social Sector Jobs, Internships, Fellowships, Scholarships in India";
const SITE_DESC = "India's dedicated platform for NGO, CSR and social sector careers. Find jobs, internships, fellowships, scholarships, grants and events from leading NGOs and development organisations.";
const SITE_IMAGE = "/logo-192.webp";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DevelopmentWala.org",
  alternateName: "Development Wala",
  url: SITE_URL,
  logo: SITE_IMAGE,
  sameAs: [
    "https://www.linkedin.com/company/developmentwala",
    "https://twitter.com/developmentwala",
  ],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevelopmentWala.org",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/jobs?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "keywords", content: "NGO jobs India, social sector jobs, development sector jobs, NGO internships, fellowships India, scholarships India, grants for NGOs, CSR jobs, nonprofit jobs" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "format-detection", content: "telephone=no" },
      { name: "theme-color", content: "#0f766e" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DevelopmentWala.org" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_IN" },
      { property: "og:title", content: SITE_TITLE },
      { name: "twitter:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { name: "twitter:description", content: SITE_DESC },
      { property: "og:image", content: SITE_IMAGE },
      { name: "twitter:image", content: SITE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@developmentwala" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: SITE_IMAGE },
      { rel: "apple-touch-icon", href: SITE_IMAGE },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://ymrzpbpjhmdkjmgqswnw.supabase.co" },
      { rel: "dns-prefetch", href: "/" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" },
      { rel: "alternate", type: "application/rss+xml", title: "DevelopmentWala.org RSS Feed", href: `${SITE_URL}/api/public/rss.xml` },
      { rel: "sitemap", type: "application/xml", href: `${SITE_URL}/sitemap.xml` },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationLd) },
      { type: "application/ld+json", children: JSON.stringify(websiteLd) },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Outlet />
          </div>
          <MobileBottomNav />
          <SignupPopup />
          <Toaster position="top-right" richColors />
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
