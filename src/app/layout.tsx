import type { Metadata } from "next";
import "./globals.css";
import TuitionApp from "@/components/tuition-app";

export const metadata: Metadata = {
  title: "TUITIONAPP — Coaching Management",
  description: "A simple, smart coaching institute management dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><TuitionApp />{children}</body>
    </html>
  );
}
