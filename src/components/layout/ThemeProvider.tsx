"use client";
import { useEffect } from "react";
import { getSettings } from "@/lib/db";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSettings().then((s) => {
      document.documentElement.classList.toggle("dark", s.theme === "dark");
    });
  }, []);
  return <>{children}</>;
}
