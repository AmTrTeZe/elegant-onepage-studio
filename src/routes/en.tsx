import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/en")({
  component: EnLayout,
});

function EnLayout() {
  return <Outlet />;
}