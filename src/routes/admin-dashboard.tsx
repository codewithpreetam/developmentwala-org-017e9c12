import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/pages/AdminDashboard";
import RequireAdmin from "@/components/admin/RequireAdmin";

export const Route = createFileRoute("/admin-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  );
}
