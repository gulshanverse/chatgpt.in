"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "./chat-provider";

type ChatSearchProps = { open: boolean; onClose: () => void; onSelect: (id: string) => void };

export function ChatSearch({ open, onClose, onSelect }: ChatSearchProps) {
  const { conversations, searchConversations } = useChat();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchConversations(query), [query, searchConversations]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const listener = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="chat-search-overlay" role="dialog" aria-modal="true" aria-label="Search chats" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="chat-search-dialog">
        <div className="chat-search-input-wrap"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" /><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="chat-search-results">
          {results.length === 0 ? <div className="chat-search-empty">{conversations.length ? "No matching chats" : "No chats yet"}</div> : results.map((conversation) => (
            <button key={conversation.id} className="chat-search-result" onClick={() => { onSelect(conversation.id); onClose(); }}>
              <strong>{conversation.title}</strong>
              <span>{conversation.messages.at(-1)?.content.slice(0, 90) || "Empty chat"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
