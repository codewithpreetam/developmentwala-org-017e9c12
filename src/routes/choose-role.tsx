import { createFileRoute } from "@tanstack/react-router";
import ChooseRole from "@/pages/ChooseRole";

export const Route = createFileRoute("/choose-role")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChooseRole />;
}
