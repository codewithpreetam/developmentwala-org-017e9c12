import { createFileRoute } from "@tanstack/react-router";
import FellowshipDetail from "@/pages/FellowshipDetail";

export const Route = createFileRoute("/fellowships/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FellowshipDetail />;
}
