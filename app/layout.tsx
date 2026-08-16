import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./responsive.css";
import "./fidelity.css";
import { ChatProvider } from "../components/chat/chat-provider";

export const metadata: Metadata = {
  title: "ChatGPT Go — AI Chat",
  description: "A high-fidelity ChatGPT-inspired interface for a hackathon project.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
