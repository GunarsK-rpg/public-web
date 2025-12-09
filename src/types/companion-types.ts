/**
 * Companion type code identifiers
 */
export type CompanionTypeCode = 'spren' | 'animal' | 'follower' | 'other';

/**
 * Companion type classifier
 */
export interface CompanionType {
  id: number;
  code: CompanionTypeCode;
  name: string;
  description?: string;
}
