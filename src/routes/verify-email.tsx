import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import VerifyEmail from "@/pages/VerifyEmail";

export const Route = createFileRoute("/verify-email")({
  head: () => staticHead({ title: 'Verify Email | DevelopmentWala.org', description: 'Verify your email address for DevelopmentWala.org.', path: "/verify-email", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <VerifyEmail />;
}
