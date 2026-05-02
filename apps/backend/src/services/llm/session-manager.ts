import { SESSION_TTL_MS, SESSION_CLEANUP_INTERVAL_MS, SESSION_MAX_TURNS } from '../../config/constants.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionData {
  sessionId: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  category: string | null;
  categoryData: Record<string, any> | null;
  currentQuestionId: string | null;
  askedQuestions: string[];
  orderReady: boolean;
  context: Record<string, any>;
  userPhotoBase64: string | null;
  pendingImageJob: PendingImageJob | null;
  imageGeneratedForOrder: boolean;
  needsImageGen: boolean;
  photoProvided: boolean;
  photoDeclined: boolean;
  lastResponse: Record<string, any> | null;
  createdAt: number;
  lastActive: number;
}

export interface PendingImageJob {
  prompt: string;
  model: string;
  steps: number;
  userPhoto: string | null;
}

// ─── Session Manager ─────────────────────────────────────────────────────────

class SessionManager {
  private sessions: Map<string, SessionData>;
  private readonly TTL: number;
  private readonly maxMessages: number;

  constructor() {
    this.sessions = new Map();
    this.TTL = SESSION_TTL_MS;
    this.maxMessages = SESSION_MAX_TURNS * 2;

    // Periodically clean up expired sessions every 10 minutes to prevent memory leaks
    setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`[SessionManager] Cleaned up ${cleaned} expired sessions.`);
      }
    }, SESSION_CLEANUP_INTERVAL_MS);
  }

  private createDefaultSession(sessionId: string): SessionData {
    return {
      sessionId,
      history: [],
      category: null,
      categoryData: null,
      currentQuestionId: null,
      askedQuestions: [],
      orderReady: false,
      context: {},
      userPhotoBase64: null,
      pendingImageJob: null,
      imageGeneratedForOrder: false,
      needsImageGen: false,
      photoProvided: false,
      photoDeclined: false,
      lastResponse: null,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
  }

  getOrCreate(sessionId: string): SessionData {
    if (!sessionId) throw new Error('sessionId is required');

    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastActive = Date.now();
      return session;
    }

    const newSession = this.createDefaultSession(sessionId);
    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  get(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  update(sessionId: string, updates: Partial<SessionData>): SessionData {
    const session = this.getOrCreate(sessionId);
    Object.assign(session, updates);
    session.lastActive = Date.now();
    return session;
  }

  /**
   * Adds a message to session history, capping to maxMessages.
   * Always ensures the first message is from 'user'.
   */
  addMessage(sessionId: string, role: 'user' | 'assistant', text: string): SessionData['history'] {
    const session = this.getOrCreate(sessionId);
    session.history.push({ role, content: text });

    if (session.history.length > this.maxMessages) {
      const preserved = session.history.slice(0, 2);
      const recent = session.history.slice(-(this.maxMessages - 2));
      session.history = [...preserved, ...recent];
    }

    // Ensure history never starts with an assistant message
    while (session.history.length > 0 && session.history[0].role === 'assistant') {
      session.history.shift();
    }

    return session.history;
  }

  reset(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, this.createDefaultSession(sessionId));
      return true;
    }
    return false;
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  cleanup(): number {
    const now = Date.now();
    let count = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActive > this.TTL) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  stats() {
    return { activeSessions: this.sessions.size };
  }
}

// Singleton export — one instance shared across all requests
export const sessionManager = new SessionManager();
