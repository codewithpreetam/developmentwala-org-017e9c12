import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitScholarship from "@/pages/SubmitScholarship";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-scholarship")({
  head: () => staticHead({ title: 'Submit Scholarship | DevelopmentWala.org', description: 'Submit a new scholarship to DevelopmentWala.org.', path: "/submit-scholarship", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitScholarship /></DashboardShell>
    </RequireAuth>
  );
}
