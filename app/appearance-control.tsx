"use client";
import { useEffect } from "react";

export function AppearanceControl() {
  useEffect(() => {
    // Mount outside managed app content only after hydration has completed.
    const theme = (globalThis as typeof globalThis & { StudyTheme?: { mount: () => void } }).StudyTheme;
    theme?.mount();
  }, []);
  return null;
}
