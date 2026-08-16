export type ChatRole = "user" | "assistant" | "system";

export type ChatAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  attachments?: ChatAttachment[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type CreateMessageInput = {
  conversationId: string;
  content: string;
  attachments?: ChatAttachment[];
};
