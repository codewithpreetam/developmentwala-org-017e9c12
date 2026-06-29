import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import ForgotPassword from "@/pages/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => staticHead({ title: 'Forgot Password | DevelopmentWala.org', description: 'Recover your DevelopmentWala.org account.', path: "/forgot-password", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPassword />;
}
