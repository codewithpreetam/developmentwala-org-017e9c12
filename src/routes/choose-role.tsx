import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/seo/listing-head";
import ChooseRole from "@/pages/ChooseRole";

export const Route = createFileRoute("/choose-role")({
  head: () => staticHead({ title: 'Choose Account Type | DevelopmentWala.org', description: "Choose how you'd like to use DevelopmentWala.org.", path: "/choose-role", noindex: true }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ChooseRole />;
}
