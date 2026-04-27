/**
 * Order Type Definitions
 * Shared between frontend and backend
 */

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'archived';

export interface Order {
  id: string;
  clientId: string;
  artisanId?: string;
  categoryId: string;
  title: string;
  description: string;
  budget?: number;
  status: OrderStatus;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateOrderRequest {
  categoryId: string;
  title: string;
  description: string;
  budget?: number;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledDate?: string;
}

export interface UpdateOrderRequest {
  title?: string;
  description?: string;
  budget?: number;
  status?: OrderStatus;
  scheduledDate?: string;
}

export interface OrderResponse {
  orderId: string;
  status: OrderStatus;
  message: string;
}

export interface OrderDetail extends Order {
  client?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
  };
  artisan?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    hourlyRate?: number;
  };
  reviews?: {
    clientReview?: string;
    artisanReview?: string;
    clientRating?: number;
    artisanRating?: number;
  };
}
