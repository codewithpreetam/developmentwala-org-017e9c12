import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import PostOpportunity from "@/pages/PostOpportunity";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/post-opportunity")({
  head: () => staticHead({ title: 'Post an Opportunity | DevelopmentWala.org', description: 'Post a new opportunity on DevelopmentWala.org.', path: "/post-opportunity", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell title="Post Opportunity">
      <PostOpportunity />
    </DashboardShell>
  );
}
