import { createFileRoute } from "@tanstack/react-router";
import PostOpportunity from "@/pages/PostOpportunity";
import DashboardShell from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/post-opportunity")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell title="Post Opportunity">
      <PostOpportunity />
    </DashboardShell>
  );
}
