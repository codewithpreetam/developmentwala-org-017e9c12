import { createFileRoute } from "@tanstack/react-router";
import GrantDetail from "@/pages/GrantDetail";

export const Route = createFileRoute("/grant-detail")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GrantDetail />;
}
