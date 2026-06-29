import { createFileRoute } from "@tanstack/react-router";
import SubmitFellowship from "@/pages/SubmitFellowship";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-fellowship")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <SubmitFellowship />
    </RequireAuth>
  );
}
