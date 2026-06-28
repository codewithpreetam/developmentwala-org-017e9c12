import { createFileRoute } from "@tanstack/react-router";
import InternshipDetail from "@/pages/InternshipDetail";

export const Route = createFileRoute("/internships/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InternshipDetail />;
}
