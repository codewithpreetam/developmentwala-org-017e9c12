import { createFileRoute } from "@tanstack/react-router";
import InternshipDetail from "@/pages/InternshipDetail";

export const Route = createFileRoute("/internship-detail")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InternshipDetail />;
}
