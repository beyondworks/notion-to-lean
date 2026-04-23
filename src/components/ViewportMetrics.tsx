"use client";

import { useEffect } from "react";

export function ViewportMetrics() {
  useEffect(() => {
    const sync = () => {
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const keyboard = Math.max(0, window.innerHeight - height - offsetTop);
      document.documentElement.style.setProperty("--app-vh", `${height}px`);
      document.documentElement.style.setProperty("--kb-b", `${keyboard}px`);
    };

    sync();
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("orientationchange", sync, { passive: true });
    window.visualViewport?.addEventListener("resize", sync, { passive: true });
    window.visualViewport?.addEventListener("scroll", sync, { passive: true });

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, []);

  return null;
}
