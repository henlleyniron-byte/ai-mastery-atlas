import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mastery Atlas v5.1 — Universal AI Systems Mastery",
  description:
    "A model-agnostic, evidence-first curriculum for understanding, evaluating, building, routing and securing modern AI systems.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
