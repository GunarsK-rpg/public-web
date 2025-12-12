// Classifiers
export * from './attribute-types';
export * from './attributes';
export * from './derived-stats';
export * from './skills';
export * from './expertise-types';
export * from './expertises';
export * from './activation-types';
export * from './action-types';
export * from './actions';
export * from './paths';
export * from './surges';
export * from './radiant-orders';
export * from './singer-forms';
export * from './talents';
export * from './units';
export * from './equipment-types';
export * from './equipment-attributes';
export * from './equipments';
export * from './currency';
export * from './conditions';
export * from './goal-status';
export * from './connection-types';
export * from './companion-types';
export * from './starting-kits';
export * from './ancestry';
export * from './culture';

// Hero data
export * from './heroes';
export * from './goals';
export * from './companions';
export * from './hero-cultures';
export * from './campaign';

// Denormalized views
export * from './character';

// Character creation wizard
export * from './character-creation';

// API types
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
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
