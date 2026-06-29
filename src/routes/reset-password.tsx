import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import ResetPassword from "@/pages/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => staticHead({ title: 'Reset Password | DevelopmentWala.org', description: 'Reset your DevelopmentWala.org account password.', path: "/reset-password", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ResetPassword />;
}
