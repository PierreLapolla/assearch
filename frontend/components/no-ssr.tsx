"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Prevents SSR for children — use for components that don't support hydration. */
export function NoSSR({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
