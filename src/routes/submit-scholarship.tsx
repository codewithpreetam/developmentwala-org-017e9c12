import { createFileRoute } from "@tanstack/react-router";
import SubmitScholarship from "@/pages/SubmitScholarship";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/submit-scholarship")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <SubmitScholarship />
    </RequireAuth>
  );
}
