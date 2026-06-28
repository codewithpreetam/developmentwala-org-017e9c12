import { createFileRoute } from "@tanstack/react-router";
import FellowshipDetail from "@/pages/FellowshipDetail";

export const Route = createFileRoute("/fellowship-detail")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FellowshipDetail />;
}
