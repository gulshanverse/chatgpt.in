"use client";

import { useEffect, useRef } from "react";
import { Copy, RotateCcw, Share } from "lucide-react";

type StreamedMessageProps = {
  content: string;
  streaming?: boolean;
};

export function StreamedMessage({ content, streaming = false }: StreamedMessageProps) {
  const endRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [content]);

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
            <button title="Copy" onClick={() => navigator.clipboard?.writeText(content)}><Copy size={16} /></button>
            <button title="Share"><Share size={16} /></button>
            <button title="Regenerate"><RotateCcw size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
