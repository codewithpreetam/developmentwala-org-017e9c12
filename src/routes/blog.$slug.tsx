import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";

export const Route = createFileRoute("/blog/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BlogPost />;
}
