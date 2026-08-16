"use client";

import type { ReactNode } from "react";
import { ChatProvider } from "./chat-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
