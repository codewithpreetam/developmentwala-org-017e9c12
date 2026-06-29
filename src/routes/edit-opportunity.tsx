import { createFileRoute } from "@tanstack/react-router";
import EditOpportunity from "@/pages/EditOpportunity";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/edit-opportunity")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <EditOpportunity />
    </RequireAuth>
  );
}
