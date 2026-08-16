"use client";

import { useEffect } from "react";
import { queueChatFileUploads } from "../../lib/chat/upload-store";

export function AttachmentUploadBridge() {
  useEffect(() => {
    const handleChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file" || !input.files?.length) return;
      void queueChatFileUploads(Array.from(input.files)).catch(() => undefined);
    };
    document.addEventListener("change", handleChange, true);
    return () => document.removeEventListener("change", handleChange, true);
  }, []);

  return null;
}
