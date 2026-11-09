import { AppearanceControl } from "./appearance-control";
import { flagshipRelease } from "@/lib/flagship-models";
import type { Metadata } from "next";
import "./globals.css";
import "../public/ui-theme/theme.css";

export const metadata: Metadata = {
  title: `AI Mastery Atlas — ${flagshipRelease}`,
  description:
    "A comprehensive AI curriculum with ten guided practical workflows, source checks, reproducible evaluations, independent assessments and exportable working notes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark" data-ui-shell="react" data-ui-family="atlas" suppressHydrationWarning>
      <head><meta name="color-scheme" content="dark light" /><script defer src="/ui-theme/theme.js" /></head>
      <body className="antialiased">{children}<AppearanceControl /></body>
    </html>
  );
}
