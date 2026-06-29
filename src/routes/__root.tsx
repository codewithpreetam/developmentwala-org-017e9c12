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
import { reportLovableError } from "../lib/lovable-error-reporting";
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
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { title: "DevelopmentWala.org — NGO & Social Sector Jobs, Internships, Fellowships, Scholarships in India" },
      { name: "description", content: "India's dedicated platform for NGO, CSR and social sector careers. Find jobs, internships, fellowships, scholarships, grants and events from leading NGOs and development organisations." },
      { name: "keywords", content: "NGO jobs India, social sector jobs, development sector jobs, NGO internships, fellowships India, scholarships India, grants for NGOs, CSR jobs, nonprofit jobs" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "DevelopmentWala.org — NGO & Social Sector Jobs in India" },
      { property: "og:description", content: "India's dedicated platform for NGO, CSR and social sector careers." },
      { property: "og:url", content: "https://www.developmentwala.org/" },
      { property: "og:image", content: "https://media.base44.com/images/public/69b1780f308798c9112e1851/407d68969_DevelopmentwalalogoaplatformforhiringsocialsectornonprofitngocsrjobsinternshipscholarshipinIndia.png" },
      { property: "og:site_name", content: "DevelopmentWala.org" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DevelopmentWala.org — NGO & Social Sector Jobs in India" },
      { name: "twitter:description", content: "India's dedicated platform for NGO, CSR and social sector careers." },
      { name: "twitter:image", content: "https://media.base44.com/images/public/69b1780f308798c9112e1851/407d68969_DevelopmentwalalogoaplatformforhiringsocialsectornonprofitngocsrjobsinternshipscholarshipinIndia.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: "https://media.base44.com/images/public/69b1780f308798c9112e1851/a97f411e6_Development-Wala-Logo-150-x-150pngbv.webp" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://www.developmentwala.org/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" },
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
