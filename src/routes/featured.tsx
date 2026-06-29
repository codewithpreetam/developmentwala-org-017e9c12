import { createFileRoute } from "@tanstack/react-router";
import Featured from "@/pages/Featured";

export const Route = createFileRoute("/featured")({
  component: Featured,
});
