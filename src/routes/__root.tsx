import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovecraftError } from "../lib/lovecraft-error-reporting";
import { useAuthStore } from "../store/auth.store";
import { Logo } from "@/components/ui/Logo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Logo className="mx-auto mb-8 h-12" />
        <h1 className="font-display text-7xl text-ivory">404</h1>
        <p className="mt-4 text-sm text-ivory/60 uppercase tracking-[0.2em]">
          This memory doesn't exist
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ivory px-6 py-3 label-caps text-charcoal"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovecraftError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-ivory">This scene didn't load</h1>
        <p className="mt-3 text-sm text-ivory/60">
          Try again — every love story deserves a retake.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-ivory px-6 py-3 label-caps text-charcoal"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root Route — Global SEO defaults
// Individual routes override title, description, canonical, OG in
// their own head() functions. This sets the site-wide fallbacks.
// ─────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Default title — overridden by each route
      { title: "LoveCraft.ai — AI Website Builder for Beautiful Personal & Business Websites" },
      {
        name: "description",
        content:
          "Create beautiful websites with AI using premium templates, powerful customisation, and fast publishing with LoveCraft.ai.",
      },
      // PWA / browser chrome
      { name: "theme-color", content: "#D4AF37" },
      // Open Graph — defaults overridden per route
      { property: "og:site_name", content: "LoveCraft.ai" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://lovecraft.ai/branding/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter/X card defaults
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@lovecraftai" },
      { name: "twitter:image", content: "https://lovecraft.ai/branding/og-default.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&display=swap",
      },
    ],
    scripts: [
      {
        // Global WebSite + Organization JSON-LD on every page
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "LoveCraft.ai",
              url: "https://lovecraft.ai",
              description:
                "Create beautiful cinematic websites with AI — love stories, Raksha Bandhan memories, birthdays, weddings and more.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://lovecraft.ai/templates?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Organization",
              name: "LoveCraft.ai",
              url: "https://lovecraft.ai",
              logo: "https://lovecraft.ai/branding/logo.png",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // useRef ensures we call initialize() exactly once on mount,
  // regardless of how many times this component re-renders.
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log("[LoveCraft Auth] Root mount — calling initialize()");
    void useAuthStore.getState().initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(20,18,16,0.95)",
            border: "1px solid rgba(212,175,55,0.25)",
            color: "#faf9f6",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
