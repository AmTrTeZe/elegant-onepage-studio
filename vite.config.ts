// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Pré-rendu statique : les deux pages publiques sont générées en HTML complet au build
    // (contenu + title/description/canonical/hreflang/OG/Twitter/JSON-LD).
    pages: [
      { path: "/" },
      { path: "/en/" },
      { path: "/mentions-legales/" },
      { path: "/confidentialite/" },
      { path: "/en/legal-notice/" },
      { path: "/en/privacy/" },
    ],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
