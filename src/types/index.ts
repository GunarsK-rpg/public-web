// Core types
export * from './attributes';
export * from './skills';
export * from './paths';
export * from './radiant';
export * from './equipment';
export * from './talents';
export * from './conditions';
export * from './companions';
export * from './goals';
export * from './expertises';
export * from './origins';
export * from './character';
export * from './campaign';

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Auth types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
