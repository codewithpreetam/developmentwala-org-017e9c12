import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/legal")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Legal />;
}
