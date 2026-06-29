import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import EditOpportunity from "@/pages/EditOpportunity";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/edit-opportunity")({
  head: () => staticHead({ title: 'Edit Opportunity | DevelopmentWala.org', description: 'Edit your existing opportunity listing.', path: "/edit-opportunity", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuth roles={['employer', 'super_admin']}>
      <DashboardShell title="Post Opportunity"><EditOpportunity /></DashboardShell>
    </RequireAuth>
  );
}
