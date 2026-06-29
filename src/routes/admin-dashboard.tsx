import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import AdminDashboard from "@/pages/AdminDashboard";
import RequireAdmin from "@/components/admin/RequireAdmin";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => staticHead({ title: 'Admin Dashboard | DevelopmentWala.org', description: 'Administrator panel for DevelopmentWala.org.', path: "/admin-dashboard", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  );
}
