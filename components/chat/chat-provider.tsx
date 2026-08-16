"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ChatMessage, Conversation } from "../../lib/chat/types";

const STORAGE_KEY = "chatgpt.in.conversations.v1";

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
  return { id: crypto.randomUUID(), title, createdAt: now, updatedAt: now, messages: [] };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setConversations(JSON.parse(stored) as Conversation[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, hydrated]);

  const addMessage = useCallback((conversationId: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, updatedAt: new Date().toISOString(), messages: [...conversation.messages, { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] }
      : conversation));
  }, []);

  const createConversationMemo = useCallback((title?: string) => {
    const conversation = createConversation(title);
    setConversations((current) => [conversation, ...current]);
    return conversation;
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
  }, []);

  const renameConversation = useCallback((conversationId: string, title: string) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, title: title.trim() || conversation.title, updatedAt: new Date().toISOString() }
      : conversation));
  }, []);

  const replaceMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, messages, updatedAt: new Date().toISOString() }
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
