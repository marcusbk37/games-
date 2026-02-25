"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!apiKey) return;

    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: false
    });
  }, []);

  return <>{children}</>;
}

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    posthog.capture("$pageview");
  }, [pathname, searchParams]);

  return null;
}

