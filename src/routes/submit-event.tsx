import { createFileRoute } from "@tanstack/react-router";
import SubmitEvent from "@/pages/SubmitEvent";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/submit-event")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <SubmitEvent />
    </RequireAuth>
  );
}
