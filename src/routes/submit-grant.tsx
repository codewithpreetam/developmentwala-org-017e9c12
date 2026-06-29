import { createFileRoute } from "@tanstack/react-router";
import SubmitGrant from "@/pages/SubmitGrant";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-grant")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitGrant /></DashboardShell>
    </RequireAuth>
  );
}
