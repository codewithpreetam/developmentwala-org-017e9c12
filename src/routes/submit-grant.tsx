import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitGrant from "@/pages/SubmitGrant";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-grant")({
  head: () => staticHead({ title: 'Submit Grant | DevelopmentWala.org', description: 'Submit a new grant to DevelopmentWala.org.', path: "/submit-grant", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitGrant /></DashboardShell>
    </RequireAuth>
  );
}
