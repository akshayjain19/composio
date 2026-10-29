import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OAuth Pathfinder · Know the path before you build",
  description: "Understand OAuth requirements before you build your integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
