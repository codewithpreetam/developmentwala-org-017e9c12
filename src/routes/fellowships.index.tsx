import { createFileRoute } from "@tanstack/react-router";
import Fellowships from "@/pages/Fellowships";

export const Route = createFileRoute("/fellowships/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Fellowships />;
}
