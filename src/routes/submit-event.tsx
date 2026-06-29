import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitEvent from "@/pages/SubmitEvent";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-event")({
  head: () => staticHead({ title: 'Submit Event | DevelopmentWala.org', description: 'Submit a new event to DevelopmentWala.org.', path: "/submit-event", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitEvent /></DashboardShell>
    </RequireAuth>
  );
}
