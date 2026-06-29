import { createFileRoute } from "@tanstack/react-router";
import SubmitJob from "@/pages/SubmitJob";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-job")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitJob /></DashboardShell>
    </RequireAuth>
  );
}
