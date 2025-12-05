/**
 * Chat types for PsychologyChat and related components
 */

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  personId?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string;
}

export interface ChatState {
  sessions: ChatSession[];
  messages: Map<string, ChatMessage[]>;
  currentSessionId: string | null;
}
