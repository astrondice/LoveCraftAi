import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : process.env.NITRO_PRESET || "node-server",
  },
  // Raw Vite options passed through to Vite configuration
  vite: {
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // 1. React Core
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "vendor-react";
            }
            // 2. TanStack ecosystem
            if (id.includes("node_modules/@tanstack")) {
              return "vendor-tanstack";
            }
            // 3. Animation Libraries
            if (id.includes("node_modules/framer-motion") || id.includes("node_modules/lenis") || id.includes("node_modules/gsap")) {
              return "vendor-animation";
            }
            // 4. 3D Graphics
            if (id.includes("node_modules/three")) {
              return "vendor-three";
            }
            // 5. Supabase Client
            if (id.includes("node_modules/@supabase")) {
              return "vendor-supabase";
            }
            // 6. Lucide Icons
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-lucide";
            }
            // 7. Zip Exporter
            if (id.includes("node_modules/jszip")) {
              return "vendor-jszip";
            }
            // 8. Shared Node Modules
            if (id.includes("node_modules")) {
              return "vendor-misc";
            }
          },
        },
      },
    },
  },
});
