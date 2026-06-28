import { createFileRoute } from "@tanstack/react-router";
import EmployerDashboard from "@/pages/EmployerDashboard";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/employer-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={'employer'}>
      <EmployerDashboard />
    </RequireAuth>
  );
}
