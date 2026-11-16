export type MessageRole = "user" | "ai";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

export interface Conversation {
  sessionId: string;
  title: string;
  updatedAt: string;
  isNew: boolean;
}

export interface ChatRequest {
  query: string;
  session_id: string;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
}

export interface HistoryResponse {
  session_id: string;
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}
