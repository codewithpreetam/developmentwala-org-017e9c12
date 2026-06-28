import { createFileRoute } from "@tanstack/react-router";
import EditOpportunity from "@/pages/EditOpportunity";
import RequireAuth from "@/components/auth/RequireAuth";

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
