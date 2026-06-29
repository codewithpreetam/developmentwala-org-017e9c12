import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import SignIn from "@/pages/SignIn";

export const Route = createFileRoute("/sign-in")({
  head: () => staticHead({ title: 'Sign In | DevelopmentWala.org', description: 'Sign in to your DevelopmentWala.org account.', path: "/sign-in", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <SignIn />;
}
