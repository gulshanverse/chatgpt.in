"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { ArrowUp, FileText, Menu, MoreHorizontal, Plus, Search, Sparkles, UserCircle, Square, Trash2, Pencil, X } from "lucide-react";
import { useChat } from "../../components/chat/chat-provider";
import { ChatSearch } from "../../components/chat/chat-search";
import { MessageContent } from "../../components/chat/message-content";
import { useChatStream } from "../../components/chat/use-chat-stream";
import { StreamedMessage } from "../../components/chat/streamed-message";
import { ModelSelector } from "../../components/chat/model-selector";
import type { ChatAttachment } from "../../lib/chat/types";

export default function ChatPage() {
  const { conversations, createConversation, addMessage, deleteConversation, renameConversation } = useChat();
  const { send, stop, isStreaming, error } = useChatStream();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const [assistantText, setAssistantText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [model, setModel] = useState("gpt-5.6");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const active = useMemo(() => conversations.find((item) => item.id === activeId), [conversations, activeId]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", size: file.size }));
    setAttachments((current) => [...current, ...next]);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (isStreaming) { stop(); return; }
    const text = draft.trim() || (attachments.length ? `Please analyze these attachments: ${attachments.map((file) => file.name).join(", ")}` : "");
    if (!text) return;
    const conversation = active ?? createConversation(text.slice(0, 48));
    const history = [...conversation.messages, { id: crypto.randomUUID(), role: "user" as const, content: text, createdAt: new Date().toISOString() }]
      .filter((message) => message.role !== "system" || message.content.trim())
      .map(({ role, content }) => ({ role, content }));
    setActiveId(conversation.id);
    addMessage(conversation.id, { role: "user", content: text, attachments });
    setDraft("");
    setAttachments([]);
    setAssistantText("");
    let full = "";
    try {
      await send({ conversationId: conversation.id, content: text, history, model, onToken: (token) => { full += token; setAssistantText(full); } });
      if (full) addMessage(conversation.id, { role: "assistant", content: full });
      setAssistantText("");
    } catch { /* stream hook exposes the error */ }
  }

  function selectChat(id: string) { stop(); setActiveId(id); setAssistantText(""); setMenuId(null); }
  function removeChat(id: string) { stop(); deleteConversation(id); if (activeId === id) { setActiveId(null); setAssistantText(""); } setMenuId(null); }
  function renameChat(id: string) {
    const current = conversations.find((item) => item.id === id);
    if (!current) return;
    const title = window.prompt("Rename chat", current.title);
    if (title?.trim()) renameConversation(id, title);
    setMenuId(null);
  }

  return (
    <main className="functional-chat">
      <ChatSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={selectChat} />
      {sidebar && <aside className="functional-sidebar">
        <div className="functional-sidebar-top">
          <button className="functional-brand" onClick={() => { stop(); setActiveId(null); setAssistantText(""); }}><Sparkles size={19} /> ChatGPT <span>Go</span></button>
          <button className="functional-icon" onClick={() => setSidebar(false)} aria-label="Close sidebar"><Menu size={19} /></button>
        </div>
        <button className="functional-new" onClick={() => { const chat = createConversation(); selectChat(chat.id); }}><Plus size={18} /> New chat</button>
        <button className="functional-search" onClick={() => setSearchOpen(true)}><Search size={17} /> Search chats <kbd>Ctrl K</kbd></button>
        <div className="functional-history">
          <div className="functional-label">Chats</div>
          {conversations.map((conversation) => (
            <div className="functional-chat-row" key={conversation.id}>
              <button className={conversation.id === activeId ? "functional-chat-item active" : "functional-chat-item"} onClick={() => selectChat(conversation.id)}>{conversation.title}</button>
              <button className="functional-chat-menu-trigger" aria-label={`Actions for ${conversation.title}`} onClick={() => setMenuId(menuId === conversation.id ? null : conversation.id)}><MoreHorizontal size={17} /></button>
              {menuId === conversation.id && <div className="functional-chat-menu">
                <button onClick={() => renameChat(conversation.id)}><Pencil size={15} /> Rename</button>
                <button className="danger" onClick={() => removeChat(conversation.id)}><Trash2 size={15} /> Delete</button>
              </div>}
            </div>
          ))}
        </div>
        <button className="functional-account"><UserCircle size={19} /><span>parthkrishna</span><small>Go</small></button>
      </aside>}
      {!sidebar && <button className="functional-open-sidebar" onClick={() => setSidebar(true)}><Menu size={20} /></button>}
      <section className="functional-main">
        <header className="functional-header"><span>{active?.title ?? "ChatGPT Go"}</span><ModelSelector value={model} onChange={setModel} /></header>
        <div className="functional-messages">
          {!active && !assistantText && <div className="functional-empty"><div className="functional-logo">✦</div><h1>How can I help you today?</h1><p>Ask anything and get a streamed response.</p></div>}
          {active?.messages.map((message) => <div key={message.id} className={message.role === "user" ? "functional-user" : "functional-saved-assistant"}>{message.role === "assistant" && <div className="functional-assistant-mark">✦</div>}<MessageContent content={message.content} />{message.attachments?.length ? <div className="functional-attachment-list">{message.attachments.map((file) => <span key={file.id}><FileText size={13} />{file.name}</span>)}</div> : null}</div>)}
          {assistantText && <StreamedMessage content={assistantText} streaming={isStreaming} />}
          {error && <div className="functional-error">{error}</div>}
        </div>
        <form className="functional-composer" onSubmit={submit}>
          <input ref={fileInput} type="file" multiple hidden onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
          {attachments.length > 0 && <div className="functional-attachments">{attachments.map((file) => <div className="functional-attachment-chip" key={file.id}><FileText size={14} /><span>{file.name}</span><button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}><X size={13} /></button></div>)}</div>}
          <div className="functional-composer-row">
            <button type="button" aria-label="Add files" onClick={() => fileInput.current?.click()}><Plus size={20} /></button>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything" autoFocus disabled={isStreaming} />
            <button className={draft.trim() || attachments.length ? "functional-send ready" : "functional-send"} aria-label={isStreaming ? "Stop generating" : "Send"} type="submit">{isStreaming ? <Square size={15} fill="currentColor" /> : <ArrowUp size={18} />}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
