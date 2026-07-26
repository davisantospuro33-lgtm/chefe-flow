// Tipos para o sistema de chat
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'story_reply' | 'call_log';

export interface Message {
  id: string;
  senderId: string; // 'chefe' ou userId do cliente
  text?: string;
  mediaUrl?: string;
  audioDuration?: number; // em segundos
  type: MessageType;
  timestamp: number;
  storyContext?: {
    storyId: string;
    storyCover: string; // URL da miniatura do story
  };
  callDuration?: number; // em segundos, para call_log
}

export interface Conversation {
  id: string;
  clientName: string;
  clientPhone: string;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface CallSession {
  id: string;
  conversationId: string;
  type: 'audio' | 'video';
  initiator: 'chefe' | 'client';
  startedAt: number;
  endedAt?: number;
  duration?: number;
}
