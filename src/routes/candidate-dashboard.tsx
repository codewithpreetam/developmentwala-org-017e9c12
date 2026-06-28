import { createFileRoute } from "@tanstack/react-router";
import CandidateDashboard from "@/pages/CandidateDashboard";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/candidate-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['candidate']}>
      <CandidateDashboard />
    </RequireAuth>
  );
}
