import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import AdminLogin from "@/pages/AdminLogin";

export const Route = createFileRoute("/admin-login")({
  head: () => staticHead({ title: 'Admin Login | DevelopmentWala.org', description: 'Administrator login for DevelopmentWala.org.', path: "/admin-login", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminLogin />;
}
