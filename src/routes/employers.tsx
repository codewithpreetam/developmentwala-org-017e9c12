import { createFileRoute } from "@tanstack/react-router";
import Employers from "@/pages/Employers";

export const Route = createFileRoute("/employers")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Employers />;
}
