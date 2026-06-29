import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SubmitInternship from "@/pages/SubmitInternship";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/submit-internship")({
  head: () => staticHead({ title: 'Submit Internship | DevelopmentWala.org', description: 'Submit a new internship to DevelopmentWala.org.', path: "/submit-internship", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><SubmitInternship /></DashboardShell>
    </RequireAuth>
  );
}
