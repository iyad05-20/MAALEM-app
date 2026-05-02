/**
 * API Client Service
 * Handles all HTTP communication with the backend Express server
 * Used by frontend instead of direct database access
 */

import { ApiResponse, ApiError, ErrorCode } from '@shared/types/API';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (this.token) return this.token;
    return localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw {
        code: error.code || ErrorCode.INTERNAL_SERVER_ERROR,
        message: error.error || error.message || 'An error occurred',
        details: error.details,
      } as ApiError;
    }

    return response.json();
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private formatError(error: any): ApiError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as ApiError;
    }

    if (error instanceof TypeError) {
      return {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the server. Please check your connection.',
      };
    }

    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error?.message || 'An unexpected error occurred',
    };
  }
}

export const apiClient = new ApiClient();

// Auth endpoints
export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
};

// Order endpoints
export const ordersAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/orders${query ? '?' + query : ''}`);
  },
  getById: (orderId: string) => apiClient.get(`/orders/${orderId}`),
  create: (data: any) => apiClient.post('/orders', data),
  update: (orderId: string, data: any) => apiClient.put(`/orders/${orderId}`, data),
  accept: (orderId: string) => apiClient.post(`/orders/${orderId}/accept`),
  complete: (orderId: string) => apiClient.post(`/orders/${orderId}/complete`),
};

// Artisan endpoints
export const artisansAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/artisans${query ? '?' + query : ''}`);
  },
  getById: (artisanId: string) => apiClient.get(`/artisans/${artisanId}`),
  updateProfile: (artisanId: string, data: any) =>
    apiClient.put(`/artisans/${artisanId}`, data),
  getOrders: (artisanId: string) => apiClient.get(`/artisans/${artisanId}/orders`),
  getReviews: (artisanId: string) => apiClient.get(`/artisans/${artisanId}/reviews`),
};

export default apiClient;
