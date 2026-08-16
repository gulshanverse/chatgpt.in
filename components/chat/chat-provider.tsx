"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ChatMessage, Conversation } from "../../lib/chat/types";

const STORAGE_KEY = "chatgpt.in.conversations.v1";
const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES_PER_CONVERSATION = 200;
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 32_000;

type ChatContextValue = {
  conversations: Conversation[];
  createConversation: (title?: string) => Conversation;
  addMessage: (conversationId: string, message: Omit<ChatMessage, "id" | "createdAt">) => void;
  deleteConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  replaceMessages: (conversationId: string, messages: ChatMessage[]) => void;
  searchConversations: (query: string) => Conversation[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

function createConversation(title = "New chat"): Conversation {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: title.trim().slice(0, MAX_TITLE_LENGTH) || "New chat", createdAt: now, updatedAt: now, messages: [] };
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatMessage>;
  return typeof message.id === "string"
    && typeof message.createdAt === "string"
    && (message.role === "user" || message.role === "assistant" || message.role === "system")
    && typeof message.content === "string";
}

function normalizeConversation(value: unknown): Conversation | null {
  if (!value || typeof value !== "object") return null;
  const conversation = value as Partial<Conversation>;
  if (typeof conversation.id !== "string" || typeof conversation.createdAt !== "string" || typeof conversation.updatedAt !== "string") return null;
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages.filter(isValidMessage).slice(-MAX_MESSAGES_PER_CONVERSATION).map((message) => ({
        ...message,
        content: message.content.slice(0, MAX_MESSAGE_LENGTH),
      }))
    : [];
  return {
    id: conversation.id,
    title: typeof conversation.title === "string" ? conversation.title.trim().slice(0, MAX_TITLE_LENGTH) || "New chat" : "New chat",
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages,
  };
}

function loadConversations(): Conversation[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Invalid conversation store");
    return parsed.map(normalizeConversation).filter((conversation): conversation is Conversation => conversation !== null).slice(0, MAX_CONVERSATIONS);
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    return [];
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConversations(loadConversations());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // Storage can fail in private/quota-restricted browser contexts; chat remains usable in memory.
    }
  }, [conversations, hydrated]);

  const addMessage = useCallback((conversationId: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? {
          ...conversation,
          updatedAt: new Date().toISOString(),
          messages: [...conversation.messages, { ...message, content: message.content.slice(0, MAX_MESSAGE_LENGTH), id: crypto.randomUUID(), createdAt: new Date().toISOString() }].slice(-MAX_MESSAGES_PER_CONVERSATION),
        }
      : conversation));
  }, []);

  const createConversationMemo = useCallback((title?: string) => {
    const conversation = createConversation(title);
    setConversations((current) => [conversation, ...current].slice(0, MAX_CONVERSATIONS));
    return conversation;
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
  }, []);

  const renameConversation = useCallback((conversationId: string, title: string) => {
    const nextTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
    if (!nextTitle) return;
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, title: nextTitle, updatedAt: new Date().toISOString() }
      : conversation));
  }, []);

  const replaceMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, messages: messages.filter(isValidMessage).slice(-MAX_MESSAGES_PER_CONVERSATION), updatedAt: new Date().toISOString() }
      : conversation));
  }, []);

  const searchConversations = useCallback((query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(normalized)
      || conversation.messages.some((message) => message.content.toLowerCase().includes(normalized)));
  }, [conversations]);

  const value = useMemo(() => ({ conversations, createConversation: createConversationMemo, addMessage, deleteConversation, renameConversation, replaceMessages, searchConversations }), [conversations, createConversationMemo, addMessage, deleteConversation, renameConversation, replaceMessages, searchConversations]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
