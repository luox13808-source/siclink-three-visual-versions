"use client";

import { useEffect, type PropsWithChildren } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import { VisualVersionProvider } from "@/components/VisualVersion";
import { useProgressiveAssets } from "@/hooks/useProgressiveAssets";

type ProvidersProps = PropsWithChildren<{
  skipLoading?: boolean;
}>;

function AppReadyEmitter() {
  useProgressiveAssets();

  useEffect(() => {
    const lenis = window.__siclinkLenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("siclink-app-ready"));
    });
  }, []);

  return null;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <VisualVersionProvider>
      <SmoothScroll>
        <AppReadyEmitter />
        {children}
      </SmoothScroll>
    </VisualVersionProvider>
  );
}
