import { createFileRoute } from "@tanstack/react-router";
import PostOpportunity from "@/pages/PostOpportunity";

export const Route = createFileRoute("/post-opportunity")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PostOpportunity />;
}
