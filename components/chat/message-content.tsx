"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type MessageContentProps = { content: string };

export function MessageContent({ content }: MessageContentProps) {
  const blocks = content.split(/```/g);
  return (
    <div className="message-content">
      {blocks.map((block, index) => {
        if (index % 2 === 1) return <CodeBlock key={index} value={block} />;
        return <MarkdownText key={index} value={block} />;
      })}
    </div>
  );
}

function MarkdownText({ value }: { value: string }) {
  return (
    <div>
      {value.split("\n").map((line, index) => {
        if (!line.trim()) return <div className="message-spacer" key={index} />;
        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        if (heading) {
          const Tag = heading[1].length === 1 ? "h2" : heading[1].length === 2 ? "h3" : "h4";
          return <Tag key={index}>{inlineMarkdown(heading[2])}</Tag>;
        }
        if (/^[-*]\s+/.test(line)) return <li key={index}>{inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>;
        return <p key={index}>{inlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function inlineMarkdown(value: string) {
  const parts = value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function CodeBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const lines = value.split("\n");
  const language = /^[\w+-]+$/.test(lines[0]?.trim() ?? "") ? lines.shift()! : "";
  const code = lines.join("\n").replace(/^\n|\n$/g, "");

  async function copy() {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="chat-code-block">
      <div className="chat-code-header"><span>{language || "code"}</span><button onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button></div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
