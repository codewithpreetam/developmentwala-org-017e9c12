import { createFileRoute } from "@tanstack/react-router";
import Internships from "@/pages/Internships";

export const Route = createFileRoute("/internships/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Internships />;
}
