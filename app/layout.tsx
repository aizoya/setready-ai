import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SetReady AI",
  description: "Production intelligence for film and television crews",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
