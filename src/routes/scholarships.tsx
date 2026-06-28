import { createFileRoute } from "@tanstack/react-router";
import Scholarships from "@/pages/Scholarships";

export const Route = createFileRoute("/scholarships")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Scholarships />;
}
