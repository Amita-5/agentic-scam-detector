export interface Message {
  sender: 'scammer' | 'honeypot';
  text: string;
  timestamp: number;
}

export interface ConversationMessage {
  role: 'user' | 'model'; // 'user' for scammer, 'model' for honeypot
  parts: { text: string }[];
}

export interface IncomingMessagePayload {
  sessionId: string;
  message: {
    sender: 'scammer';
    text: string;
    timestamp: number;
  };
  conversationHistory: Message[];
  metadata: {
    channel: string;
    language: string;
    locale: string;
  };
}

export interface OutgoingResponsePayload {
  status: 'success' | 'error';
  reply: string;
  scamDetected?: boolean;
}

export interface ExtractedIntelligence {
  bankAccounts: string[];
  upiIds: string[];
  phishingLinks: string[];
  phoneNumbers: string[];
  suspiciousKeywords: string[];
}

export interface HoneypotSession {
  sessionId: string;
  conversationHistory: Message[];
  scamDetected: boolean;
  totalMessagesExchanged: number;
  extractedIntelligence: ExtractedIntelligence;
  agentNotes: string;
  scamType: string | null;
  status: 'active' | 'completed';
}

export interface FinalResultPayload {
  sessionId: string;
  scamDetected: boolean;
  totalMessagesExchanged: number;
  extractedIntelligence: ExtractedIntelligence;
  agentNotes: string;
}

export interface ScamDetectionResult {
  isScam: boolean;
  scamType: string | null;
  initialReply: string;
}

export interface AgentResponse {
  reply: string;
}

export interface AgentNotes {
  notes: string;
}