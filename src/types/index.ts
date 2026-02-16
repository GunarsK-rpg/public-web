// Shared types
export * from './shared';

// Base types
export * from './classifier';

// Classifiers
export * from './attributes';
export * from './derivedStats';
export * from './skills';
export * from './expertises';
export * from './actions';
export * from './paths';
export * from './surges';
export * from './radiantOrders';
export * from './singerForms';
export * from './talents';
export * from './units';
export * from './equipmentAttributes';
export * from './equipments';
export * from './conditions';
export * from './companionTypes';
export * from './startingKits';
export * from './ancestries';
export * from './culture';
export * from './tiers';
export * from './levels';

// Classifier aggregate response
export * from './classifiers';

// Hero entity and data
export * from './heroes';
export * from './goals';
export * from './companions';
export * from './campaign';

// Wizard
export * from './wizard';

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
}

// Auth types
export interface User {
  id: number;
  username: string;
}
