import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import EmployerDashboard from "@/pages/EmployerDashboard";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/employer-dashboard")({
  head: () => staticHead({ title: 'Employer Dashboard | DevelopmentWala.org', description: 'Manage your job postings and applicants.', path: "/employer-dashboard", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer']}>
      <EmployerDashboard />
    </RequireAuth>
  );
}
