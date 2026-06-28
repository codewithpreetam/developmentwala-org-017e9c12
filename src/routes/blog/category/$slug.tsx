import { createFileRoute } from "@tanstack/react-router";
import BlogCategory from "@/pages/BlogCategory";

export const Route = createFileRoute("/blog/category/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BlogCategory />;
}
