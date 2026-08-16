"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Share } from "lucide-react";

type StreamedMessageProps = {
  content: string;
  streaming?: boolean;
  onRegenerate?: () => void;
};

export function StreamedMessage({ content, streaming = false, onRegenerate }: StreamedMessageProps) {
  const endRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [content]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch { /* Clipboard can be unavailable without a secure context. */ }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "ChatGPT response", text: content }).catch(() => undefined);
      return;
    }
    await copy();
  }

  return (
    <div className="assistant-row">
      <div className="assistant-mark">✦</div>
      <div className="assistant-content streamed-content">
        {content.split("\n").map((line, index) => (
          <p key={`${index}-${line.slice(0, 12)}`}>{line || "\u00a0"}</p>
        ))}
        {streaming && <span className="streaming-cursor" aria-label="Generating" />}
        <span ref={endRef} />
        {!streaming && content && (
          <div className="message-actions">
            <button type="button" title={copied ? "Copied" : "Copy"} aria-label={copied ? "Copied" : "Copy"} onClick={() => void copy()}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
            <button type="button" title="Share" aria-label="Share" onClick={() => void share()}><Share size={16} /></button>
            {onRegenerate && <button type="button" title="Regenerate" aria-label="Regenerate" onClick={onRegenerate}><RotateCcw size={16} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}
