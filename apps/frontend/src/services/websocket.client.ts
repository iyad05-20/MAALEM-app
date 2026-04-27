/**
 * WebSocket Client Service
 * Handles real-time communication with backend via Socket.io
 */

import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '@shared/types/API';

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WEBSOCKET_URL, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('⚠️  WebSocket disconnected');
        });

        // Set up event listeners
        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Chat events
    this.socket.on('receive-message', (data) => {
      this.emit('chat:message', data);
    });

    this.socket.on('user-typing', (data) => {
      this.emit('chat:typing', data);
    });

    // Order events
    this.socket.on('order:created', (data) => {
      this.emit('order:created', data);
    });

    this.socket.on('order:updated', (data) => {
      this.emit('order:updated', data);
    });

    this.socket.on('order:accepted', (data) => {
      this.emit('order:accepted', data);
    });

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.emit('notification:new', data);
    });
  }

  joinOrder(orderId: string): void {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }
    this.socket.emit('join-order', orderId);
  }

  leaveOrder(orderId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave-order', orderId);
  }

  sendMessage(orderId: string, senderId: string, text: string): void {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }
    this.socket.emit('send-message', { orderId, senderId, text });
  }

  sendTyping(orderId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing', { orderId, userId });
  }

  on(event: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();
export default wsClient;
