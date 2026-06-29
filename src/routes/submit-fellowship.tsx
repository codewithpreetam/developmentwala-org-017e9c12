import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitFellowship from "@/pages/SubmitFellowship";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-fellowship")({
  head: () => staticHead({ title: 'Submit Fellowship | DevelopmentWala.org', description: 'Submit a new fellowship to DevelopmentWala.org.', path: "/submit-fellowship", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitFellowship /></DashboardShell>
    </RequireAuth>
  );
}
