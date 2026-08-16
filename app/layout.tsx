import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatGPT UI Clone",
  description: "A faithful ChatGPT-inspired interface for a hackathon project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
