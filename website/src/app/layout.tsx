import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapRecall Waitlist",
  description:
    "Capture your screen, extract key facts instantly, and recall anything later with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
