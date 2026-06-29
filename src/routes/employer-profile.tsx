import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import EmployerProfile from "@/pages/EmployerProfile";

export const Route = createFileRoute("/employer-profile")({
  head: () => staticHead({ title: 'Employer Profile | DevelopmentWala.org', description: 'Manage your organisation profile.', path: "/employer-profile", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployerProfile />;
}
