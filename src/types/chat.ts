export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChatHistory {
  messages?: Message[];
} 