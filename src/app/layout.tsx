import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TUITIONAPP — Coaching Management",
  description: "A simple, smart coaching institute management dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
