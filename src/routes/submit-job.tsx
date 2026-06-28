import { createFileRoute } from "@tanstack/react-router";
import SubmitJob from "@/pages/SubmitJob";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/submit-job")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={'employer', 'super_admin'}>
      <SubmitJob />
    </RequireAuth>
  );
}
