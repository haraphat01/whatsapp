"use client";

import { useEffect, useRef } from "react";

/**
 * Flags #render-ready only after hydration, once ChatWindow's own mount
 * effects (like auto-scroll) have run. The exporters wait for this flag, so
 * any scroll position they set afterwards won't be overridden.
 */
export function RenderReady() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.setAttribute("data-ready", "true");
  }, []);
  return <div ref={ref} id="render-ready" style={{ display: "none" }} />;
}
