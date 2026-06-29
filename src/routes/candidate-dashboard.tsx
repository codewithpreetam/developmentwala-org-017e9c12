import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import CandidateDashboard from "@/pages/CandidateDashboard";
import RequireAuth from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/candidate-dashboard")({
  head: () => staticHead({ title: 'Candidate Dashboard | DevelopmentWala.org', description: 'Manage your applications and saved opportunities.', path: "/candidate-dashboard", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['candidate']}>
      <CandidateDashboard />
    </RequireAuth>
  );
}
