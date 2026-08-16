"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, FileText, Menu, MoreHorizontal, Plus, Search, Sparkles, UserCircle, Square, Trash2, Pencil, X, Mic, RotateCcw } from "lucide-react";
import { useChat } from "../../components/chat/chat-provider";
import { ChatSearch } from "../../components/chat/chat-search";
import { MessageContent } from "../../components/chat/message-content";
import { useChatStream } from "../../components/chat/use-chat-stream";
import { StreamedMessage } from "../../components/chat/streamed-message";
import { ModelSelector } from "../../components/chat/model-selector";
import { queueChatFileUploads } from "../../lib/chat/upload-store";
import type { ChatAttachment, ChatMessage } from "../../lib/chat/types";

const MODEL_KEY = "chatgpt.in.model.v1";

export default function ChatPage() {
  const { conversations, createConversation, addMessage, deleteConversation, renameConversation, replaceMessages } = useChat();
  const { send, stop, isStreaming, error } = useChatStream();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const [assistantText, setAssistantText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [model, setModel] = useState("gpt-5.6");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initialSelectionDone = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const active = useMemo(() => conversations.find((item) => item.id === activeId), [conversations, activeId]);

  useEffect(() => { try { const saved = window.localStorage.getItem(MODEL_KEY); if (saved) setModel(saved); } catch {} }, []);
  useEffect(() => { try { window.localStorage.setItem(MODEL_KEY, model); } catch {} }, [model]);
  useEffect(() => {
    if (initialSelectionDone.current || conversations.length === 0) return;
    const mostRecent = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (mostRecent) setActiveId(mostRecent.id);
    initialSelectionDone.current = true;
  }, [conversations]);
  useEffect(() => {
    return () => {
      recorder.current?.stop();
      mediaStream.current?.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
      recorder.current = null;
      audioChunks.current = [];
      stop();
    };
  }, [stop]);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } if (event.key === "Escape") { setSearchOpen(false); setSettingsOpen(false); setMenuId(null); if (window.innerWidth <= 760) setSidebar(false); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    setAttachments((current) => [...current, ...selected.map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", size: file.size }))]);
    void queueChatFileUploads(selected).catch((uploadError) => setVoiceError(uploadError instanceof Error ? uploadError.message : "Unable to upload attachment"));
  }
  async function transcribe(blob: Blob) { setTranscribing(true); setVoiceError(null); try { const form = new FormData(); form.append("audio", new File([blob], "voice.webm", { type: blob.type || "audio/webm" })); const response = await fetch("/api/transcribe", { method: "POST", body: form }); const data = await response.json() as { text?: string; error?: string }; if (!response.ok) throw new Error(data.error || "Transcription failed"); const text = data.text?.trim(); if (text) setDraft((current) => `${current}${current.trim() ? " " : ""}${text}`); } catch (error) { setVoiceError(error instanceof Error ? error.message : "Voice transcription failed"); } finally { setTranscribing(false); } }
  async function toggleRecording() { if (recording) { recorder.current?.stop(); mediaStream.current?.getTracks().forEach((track) => track.stop()); setRecording(false); return; } if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setVoiceError("Voice recording is not supported by this browser."); return; } try { setVoiceError(null); const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mediaStream.current = stream; audioChunks.current = []; const nextRecorder = new MediaRecorder(stream); recorder.current = nextRecorder; nextRecorder.ondataavailable = (event) => { if (event.data.size) audioChunks.current.push(event.data); }; nextRecorder.onstop = () => { const blob = new Blob(audioChunks.current, { type: nextRecorder.mimeType || "audio/webm" }); void transcribe(blob); audioChunks.current = []; mediaStream.current?.getTracks().forEach((track) => track.stop()); mediaStream.current = null; recorder.current = null; }; nextRecorder.start(); setRecording(true); } catch (error) { setVoiceError(error instanceof Error ? error.message : "Microphone access was denied"); } }
  async function runGeneration(conversationId: string, history: ChatMessage[], content: string) { setAssistantText(""); let full = ""; const inputHistory = history.map(({ role, content: messageContent }) => ({ role, content: messageContent })); try { await send({ conversationId, content, history: inputHistory, model, onToken: (token) => { full += token; setAssistantText(full); } }); if (full) addMessage(conversationId, { role: "assistant", content: full }); setAssistantText(""); } catch {} }
  async function submit(event?: FormEvent) { event?.preventDefault(); if (isStreaming) { stop(); return; } const text = draft.trim() || (attachments.length ? `Please analyze these attachments: ${attachments.map((file) => file.name).join(", ")}` : ""); if (!text) return; const conversation = active ?? createConversation(text.slice(0, 48)); const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: new Date().toISOString(), attachments }; setActiveId(conversation.id); addMessage(conversation.id, { role: "user", content: text, attachments }); setDraft(""); setAttachments([]); await runGeneration(conversation.id, [...conversation.messages, userMessage], text); }
  async function regenerate() { if (!active || isStreaming) return; const lastUser = [...active.messages].reverse().find((message) => message.role === "user"); if (!lastUser) return; const userIndex = active.messages.findIndex((message) => message.id === lastUser.id); const preserved = active.messages.slice(0, userIndex + 1); replaceMessages(active.id, preserved); await runGeneration(active.id, preserved, lastUser.content); }
  function selectChat(id: string) { stop(); setActiveId(id); setAssistantText(""); setMenuId(null); if (window.innerWidth <= 760) setSidebar(false); }
  function removeChat(id: string) { stop(); deleteConversation(id); if (activeId === id) { setActiveId(null); setAssistantText(""); } setMenuId(null); }
  function renameChat(id: string) { const current = conversations.find((item) => item.id === id); if (!current) return; const title = window.prompt("Rename chat", current.title); if (title?.trim()) renameConversation(id, title); setMenuId(null); }

  return <main className="functional-chat">
    <ChatSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={selectChat} />
    {settingsOpen && <div className="functional-settings-backdrop" role="dialog" aria-modal="true" aria-label="Chat settings" onMouseDown={(event) => { if (event.currentTarget === event.target) setSettingsOpen(false); }}><div className="functional-settings"><div className="functional-settings-head"><strong>Settings</strong><button onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={18} /></button></div><label>Model<ModelSelector value={model} onChange={setModel} /></label><p>Your selected model is saved in this browser.</p><button type="button" className="functional-reset" onClick={() => { try { window.localStorage.removeItem(MODEL_KEY); } catch {} setModel("gpt-5.6"); }}>Reset model preference</button></div></div>}
    {sidebar && <aside className="functional-sidebar"><div className="functional-sidebar-top"><button className="functional-brand" onClick={() => { stop(); setActiveId(null); setAssistantText(""); if (window.innerWidth <= 760) setSidebar(false); }}><Sparkles size={19} /> ChatGPT <span>Go</span></button><button className="functional-icon" onClick={() => setSidebar(false)} aria-label="Close sidebar"><Menu size={19} /></button></div><button className="functional-new" onClick={() => { const chat = createConversation(); selectChat(chat.id); }}><Plus size={18} /> New chat</button><button className="functional-search" onClick={() => setSearchOpen(true)}><Search size={17} /> Search chats <kbd>Ctrl K</kbd></button><div className="functional-history"><div className="functional-label">Chats</div>{conversations.map((conversation) => <div className="functional-chat-row" key={conversation.id}><button className={conversation.id === activeId ? "functional-chat-item active" : "functional-chat-item"} onClick={() => selectChat(conversation.id)}>{conversation.title}</button><button className="functional-chat-menu-trigger" aria-label={`Actions for ${conversation.title}`} onClick={() => setMenuId(menuId === conversation.id ? null : conversation.id)}><MoreHorizontal size={17} /></button>{menuId === conversation.id && <div className="functional-chat-menu"><button onClick={() => renameChat(conversation.id)}><Pencil size={15} /> Rename</button><button className="danger" onClick={() => removeChat(conversation.id)}><Trash2 size={15} /> Delete</button></div>}</div>)}</div><button className="functional-account" onClick={() => setSettingsOpen(true)}><UserCircle size={19} /><span>Account</span><small>Settings</small></button></aside>}
    {sidebar && <button className="functional-sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebar(false)} />}
    {!sidebar && <button className="functional-open-sidebar" onClick={() => setSidebar(true)} aria-label="Open navigation"><Menu size={20} /></button>}
    <section className="functional-main"><header className="functional-header"><span>{active?.title ?? "ChatGPT Go"}</span><ModelSelector value={model} onChange={setModel} /></header><div className="functional-messages">
      {!active && !assistantText && <div className="functional-empty"><div className="functional-logo">✦</div><h1>How can I help you today?</h1><p>Ask anything and get a streamed response.</p></div>}
      {active?.messages.map((message) => <div key={message.id} className={message.role === "user" ? "functional-user" : "functional-saved-assistant"}>{message.role === "assistant" && <div className="functional-assistant-mark">✦</div>}<MessageContent content={message.content} />{message.attachments?.length ? <div className="functional-attachment-list">{message.attachments.map((file) => <span key={file.id}><FileText size={13} />{file.name}</span>)}</div> : null}</div>)}
      {assistantText && <StreamedMessage content={assistantText} streaming={isStreaming} onRegenerate={regenerate} />}
      {!isStreaming && active?.messages.some((message) => message.role === "assistant") && !assistantText && <div className="functional-last-actions"><button type="button" onClick={() => void regenerate()}><RotateCcw size={15} /> Regenerate</button></div>}
      {error && <div className="functional-error">{error}</div>}{voiceError && <div className="functional-error">{voiceError}</div>}
    </div><form className="functional-composer" onSubmit={submit}><input ref={fileInput} type="file" multiple hidden onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />{attachments.length > 0 && <div className="functional-attachments">{attachments.map((file) => <div className="functional-attachment-chip" key={file.id}><FileText size={14} /><span>{file.name}</span><button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}><X size={13} /></button></div>)}</div>}<div className="functional-composer-row"><button type="button" aria-label="Add files" onClick={() => fileInput.current?.click()}><Plus size={20} /></button><input value={transcribing ? "Transcribing voice…" : draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything" autoFocus disabled={isStreaming || transcribing} /><button type="button" aria-label={recording ? "Stop recording" : "Record voice"} onClick={() => void toggleRecording()} disabled={isStreaming || transcribing} className={recording ? "functional-voice recording" : "functional-voice"}>{recording ? <Square size={15} fill="currentColor" /> : <Mic size={18} />}</button><button className={draft.trim() || attachments.length ? "functional-send ready" : "functional-send"} aria-label={isStreaming ? "Stop generating" : "Send"} type="submit">{isStreaming ? <Square size={15} fill="currentColor" /> : <ArrowUp size={18} />}</button></div></form></section>
  </main>;
}
