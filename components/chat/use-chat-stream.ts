"use client";

import { useCallback, useState } from "react";

type StreamState = "idle" | "streaming" | "error";

type StreamOptions = {
  conversationId?: string;
  content: string;
  onConversation?: (conversationId: string) => void;
  onToken?: (token: string) => void;
};

export function useChatStream() {
  const [state, setState] = useState<StreamState>("idle");
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async ({ conversationId, content, onConversation, onToken }: StreamOptions) => {
    setState("streaming");
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to start the chat stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const eventName = event.split("\n").find((line) => line.startsWith("event: "))?.slice(7).trim();
          const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
          if (!dataLine) continue;
          const data = JSON.parse(dataLine.slice(6)) as { conversationId?: string; token?: string; error?: string };
          if (data.conversationId) onConversation?.(data.conversationId);
          if (data.token) onToken?.(data.token);
          if (eventName === "error" || data.error) throw new Error(data.error ?? "Chat stream failed");
        }

        if (done) break;
      }

      setState("idle");
    } catch (streamError) {
      const message = streamError instanceof Error ? streamError.message : "Chat stream failed";
      setError(message);
      setState("error");
      throw streamError;
    }
  }, []);

  return { send, state, error, isStreaming: state === "streaming" };
}
