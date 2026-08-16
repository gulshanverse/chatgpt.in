"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type MessageContentProps = { content: string };

export function MessageContent({ content }: MessageContentProps) {
  const blocks = content.split(/```/g);
  return (
    <div className="message-content">
      {blocks.map((block, index) => {
        if (index % 2 === 1) return <CodeBlock key={index} value={block} />;
        return <MarkdownText key={index} value={block} />;
      })}
      <MessageActions content={content} />
    </div>
  );
}

function MarkdownText({ value }: { value: string }) {
  const lines = value.split("\n");
  const rendered: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function flushList() {
    if (!listItems.length) return;
    rendered.push(<ul key={`list-${rendered.length}`}>{listItems}</ul>);
    listItems = [];
  }

  lines.forEach((line, index) => {
    if (!line.trim()) {
      flushList();
      rendered.push(<div className="message-spacer" key={`space-${index}`} />);
      return;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushList();
      const Tag = heading[1].length === 1 ? "h2" : heading[1].length === 2 ? "h3" : "h4";
      rendered.push(<Tag key={`heading-${index}`}>{inlineMarkdown(heading[2])}</Tag>);
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(<li key={`item-${index}`}>{inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>);
      return;
    }

    flushList();
    rendered.push(<p key={`paragraph-${index}`}>{inlineMarkdown(line)}</p>);
  });

  flushList();
  return <div>{rendered}</div>;
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

function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: content });
      } else {
        await navigator.clipboard.writeText(content);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1400);
    } catch {
      setShared(false);
    }
  }

  return (
    <div className="message-actions" aria-label="Message actions">
      <button type="button" onClick={() => void copy()} aria-label="Copy response" title={copied ? "Copied" : "Copy"}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <button type="button" onClick={() => void share()} aria-label="Share response" title={shared ? "Shared" : "Share"}>
        <Share2 size={15} />
      </button>
    </div>
  );
}
