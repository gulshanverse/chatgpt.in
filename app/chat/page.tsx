"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUp, Menu, Plus, Sparkles, UserCircle, Square } from "lucide-react";
import { useChat } from "../../components/chat/chat-provider";
import { useChatStream } from "../../components/chat/use-chat-stream";
import { StreamedMessage } from "../../components/chat/streamed-message";

export default function ChatPage() {
  const { conversations, createConversation, addMessage } = useChat();
  const { send, isStreaming, error } = useChatStream();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const [assistantText, setAssistantText] = useState("");

  const active = useMemo(() => conversations.find((item) => item.id === activeId), [conversations, activeId]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || isStreaming) return;

    const conversation = active ?? createConversation(text.slice(0, 48));
    setActiveId(conversation.id);
    addMessage(conversation.id, { role: "user", content: text });
    setDraft("");
    setAssistantText("");

    let full = "";
    try {
      await send({
        conversationId: conversation.id,
        content: text,
        onToken: (token) => {
          full += token;
          setAssistantText(full);
        },
      });
      if (full) addMessage(conversation.id, { role: "assistant", content: full });
      setAssistantText("");
    } catch {
      // The hook exposes the error state to the UI; keep the typed message intact.
    }
  }

  return (
    <main className="functional-chat">
      {sidebar && <aside className="functional-sidebar">
        <div className="functional-sidebar-top">
          <button className="functional-brand" onClick={() => { setActiveId(null); setAssistantText(""); }}><Sparkles size={19} /> ChatGPT <span>Go</span></button>
          <button className="functional-icon" onClick={() => setSidebar(false)} aria-label="Close sidebar"><Menu size={19} /></button>
        </div>
        <button className="functional-new" onClick={() => { const chat = createConversation(); setActiveId(chat.id); setAssistantText(""); }}><Plus size={18} /> New chat</button>
        <div className="functional-history">
          <div className="functional-label">Chats</div>
          {conversations.map((conversation) => (
            <button key={conversation.id} className={conversation.id === activeId ? "functional-chat-item active" : "functional-chat-item"} onClick={() => { setActiveId(conversation.id); setAssistantText(""); }}>
              {conversation.title}
            </button>
          ))}
        </div>
        <button className="functional-account"><UserCircle size={19} /><span>parthkrishna</span><small>Go</small></button>
      </aside>}

      {!sidebar && <button className="functional-open-sidebar" onClick={() => setSidebar(true)}><Menu size={20} /></button>}

      <section className="functional-main">
        <header className="functional-header"><span>{active?.title ?? "ChatGPT Go"}</span><button><span>Share</span></button></header>
        <div className="functional-messages">
          {!active && !assistantText && <div className="functional-empty"><div className="functional-logo">✦</div><h1>How can I help you today?</h1><p>Ask anything and get a streamed response.</p></div>}
          {active?.messages.map((message) => message.role === "user" ? <div className="functional-user" key={message.id}>{message.content}</div> : <div className="functional-saved-assistant" key={message.id}><div className="functional-assistant-mark">✦</div><div>{message.content}</div></div>)}
          {assistantText && <StreamedMessage content={assistantText} streaming={isStreaming} />}
          {error && <div className="functional-error">{error}</div>}
        </div>
        <form className="functional-composer" onSubmit={submit}>
          <button type="button" aria-label="Add"><Plus size={20} /></button>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything" autoFocus disabled={isStreaming} />
          <button className={draft.trim() && !isStreaming ? "functional-send ready" : "functional-send"} aria-label={isStreaming ? "Generating" : "Send"} type="submit">{isStreaming ? <Square size={15} fill="currentColor" /> : <ArrowUp size={18} />}</button>
        </form>
      </section>
    </main>
  );
}
