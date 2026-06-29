import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitJob from "@/pages/SubmitJob";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-job")({
  head: () => staticHead({ title: 'Submit Job | DevelopmentWala.org', description: 'Submit a new job to DevelopmentWala.org.', path: "/submit-job", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitJob /></DashboardShell>
    </RequireAuth>
  );
}
