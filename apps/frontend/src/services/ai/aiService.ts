import { apiClient } from '../api.client';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export interface ChatResponse {
  success: boolean;
  reply: string;
  suggestions?: string[];
  askForPhoto?: boolean;
  imageUrl?: string | null;
  orderReady: boolean;
  order?: {
    title: string | null;
    description: string | null;
  } | null;
  sessionState?: {
    category: string | null;
    clarityScore: number;
    turns: number;
  };
  error?: string;
}

class AIService {
  private sessionId: string;

  constructor() {
    this.sessionId = generateSessionId();
  }

  public async resetSession(): Promise<boolean> {
    try {
      const response = await apiClient.post('/chat/reset', { sessionId: this.sessionId });
      this.sessionId = generateSessionId();
      return response.success || true;
    } catch (error) {
      console.error('[aiService] Failed to reset session:', error);
      this.sessionId = generateSessionId();
      return false;
    }
  }

  public async sendMessage(message: string, photoBase64?: string): Promise<ChatResponse> {
    try {
      const payload: any = {
        sessionId: this.sessionId,
        message
      };
      
      if (photoBase64) {
        payload.photo = photoBase64;
      }

      const response = await apiClient.post<ChatResponse>('/chat', payload);
      return response as any as ChatResponse; // Assuming ApiResponse structure wraps this
      
    } catch (error: any) {
      console.error('[aiService] Error calling chat endpoint:', error);
      return {
        success: false,
        reply: "Désolé, j'ai eu un problème de connexion. Pouvez-vous répéter ?",
        orderReady: false,
        error: error.message
      };
    }
  }
}

export const aiService = new AIService();
