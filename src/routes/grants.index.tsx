import { createFileRoute } from "@tanstack/react-router";
import Grants from "@/pages/Grants";

export const Route = createFileRoute("/grants")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Grants />;
}
