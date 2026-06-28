import { createFileRoute } from "@tanstack/react-router";
import GrantDetail from "@/pages/GrantDetail";

export const Route = createFileRoute("/grants/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GrantDetail />;
}
