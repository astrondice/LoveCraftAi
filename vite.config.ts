import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : process.env.NITRO_PRESET || "node-server",
  },
  build: {
    // Raise the warning threshold (kB). Chunks above this will still warn.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          // TanStack ecosystem
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-tanstack";
          }
          // Radix UI components
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          // Animation / 3D
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/gsap")) {
            return "vendor-animation";
          }
          if (id.includes("node_modules/three")) {
            return "vendor-three";
          }
          // Supabase
          if (id.includes("node_modules/@supabase")) {
            return "vendor-supabase";
          }
          // Charts
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3")) {
            return "vendor-charts";
          }
          // Everything else in node_modules goes into a shared vendor chunk
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
});
