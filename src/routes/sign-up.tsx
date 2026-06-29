import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SignUp from "@/pages/SignUp";

export const Route = createFileRoute("/sign-up")({
  head: () => staticHead({ title: 'Sign Up | DevelopmentWala.org', description: 'Create your free DevelopmentWala.org account.', path: "/sign-up", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUp />;
}
