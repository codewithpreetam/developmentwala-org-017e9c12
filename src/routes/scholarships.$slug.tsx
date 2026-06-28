import { createFileRoute } from "@tanstack/react-router";
import ScholarshipDetail from "@/pages/ScholarshipDetail";

export const Route = createFileRoute("/scholarships/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ScholarshipDetail />;
}
