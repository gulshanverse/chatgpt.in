"use client";

import { useCallback, useRef, useState } from "react";
import { consumeUploadedChatFiles, getUploadedChatFiles } from "../../lib/chat/upload-store";

type StreamState = "idle" | "streaming" | "error";
type HistoryMessage = { role: "user" | "assistant" | "system"; content: string };
type ChatAttachmentInput = { id: string; name: string; type: string; size: number };
type StreamEventData = { conversationId?: string; token?: string; error?: string };

type StreamOptions = {
  conversationId?: string;
  content: string;
  history?: HistoryMessage[];
  model?: string;
  attachments?: ChatAttachmentInput[];
  onConversation?: (conversationId: string) => void;
  onToken?: (token: string) => void;
};

function parseEvent(event: string): { name?: string; data?: StreamEventData } | null {
  const lines = event.split("\n");
  const name = lines.find((line) => line.startsWith("event: "))?.slice(7).trim();
  const dataLine = lines.find((line) => line.startsWith("data: "));
  if (!dataLine) return null;
  try {
    const parsed = JSON.parse(dataLine.slice(6)) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    return { name, data: { conversationId: typeof value.conversationId === "string" ? value.conversationId : undefined, token: typeof value.token === "string" ? value.token : undefined, error: typeof value.error === "string" ? value.error : undefined } };
  } catch { return null; }
}

export function useChatStream() {
  const [state, setState] = useState<StreamState>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => { controllerRef.current?.abort(); controllerRef.current = null; setState("idle"); }, []);

  const send = useCallback(async ({ conversationId, content, history, model, attachments, onConversation, onToken }: StreamOptions) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState("streaming");
    setError(null);

    try {
      const selected = attachments ?? [];
      const selectedIds = selected.map((attachment) => attachment.id);
      const queuedAttachments = await getUploadedChatFiles(selectedIds);
      const uploadedByClientId = new Map(queuedAttachments.map((attachment) => [attachment.clientId, attachment]));
      if (selectedIds.length !== uploadedByClientId.size) throw new Error("One or more attachments failed to upload. Please retry the upload.");
      const allAttachments = selected.flatMap((attachment) => {
        const uploaded = uploadedByClientId.get(attachment.id);
        return uploaded ? [{ id: uploaded.id, name: uploaded.name, type: uploaded.type, size: uploaded.size }] : [];
      });
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, content, history, model, attachments: allAttachments }), signal: controller.signal });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to start the chat stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const processEvents = (input: string) => {
        const events = input.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const parsed = parseEvent(event);
          if (!parsed?.data) continue;
          if (parsed.data.conversationId) onConversation?.(parsed.data.conversationId);
          if (parsed.data.token) onToken?.(parsed.data.token);
          if (parsed.name === "error" || parsed.data.error) throw new Error(parsed.data.error ?? "Chat stream failed");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        processEvents(buffer);
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) {
            const parsed = parseEvent(buffer);
            if (parsed?.data) {
              if (parsed.data.conversationId) onConversation?.(parsed.data.conversationId);
              if (parsed.data.token) onToken?.(parsed.data.token);
              if (parsed.name === "error" || parsed.data.error) throw new Error(parsed.data.error ?? "Chat stream failed");
            }
          }
          break;
        }
      }
      if (!controller.signal.aborted) {
        await consumeUploadedChatFiles(selectedIds);
        setState("idle");
      }
    } catch (streamError) {
      if (controller.signal.aborted) return;
      const message = streamError instanceof Error ? streamError.message : "Chat stream failed";
      setError(message);
      setState("error");
      throw streamError;
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  return { send, stop, state, error, isStreaming: state === "streaming" };
}
