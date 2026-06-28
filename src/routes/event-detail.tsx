import { createFileRoute } from "@tanstack/react-router";
import EventDetail from "@/pages/EventDetail";

export const Route = createFileRoute("/event-detail")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EventDetail />;
}
