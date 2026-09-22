import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // "/en" redirige vers "/en/" : la version anglaise vit avec la barre finale.
    trailingSlash: "always",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
