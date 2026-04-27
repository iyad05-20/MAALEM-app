/**
 * User Type Definitions
 * Shared between frontend and backend
 */

export type UserRole = 'client' | 'artisan' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface ArtisanProfile extends UserProfile {
  role: 'artisan';
  skills: string[];
  portfolio?: string[];
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface ClientProfile extends UserProfile {
  role: 'client';
  favoriteArtisans?: string[];
  totalOrders?: number;
}
