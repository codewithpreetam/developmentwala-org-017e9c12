import { createFileRoute } from "@tanstack/react-router";
import SubmitInternship from "@/pages/SubmitInternship";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/submit-internship")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={'employer', 'super_admin'}>
      <SubmitInternship />
    </RequireAuth>
  );
}
