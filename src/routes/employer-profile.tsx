import { createFileRoute } from "@tanstack/react-router";
import EmployerProfile from "@/pages/EmployerProfile";

export const Route = createFileRoute("/employer-profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployerProfile />;
}
