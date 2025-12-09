/**
 * Culture code identifiers
 */
export type CultureCode =
  | 'alethi'
  | 'azish'
  | 'herdazian'
  | 'iriali'
  | 'kharbranthian'
  | 'listener'
  | 'natan'
  | 'reshi'
  | 'shin'
  | 'thaylen'
  | 'unkalaki'
  | 'veden'
  | 'wayfarer'
  | 'high-society';

/**
 * Culture classifier
 */
export interface Culture {
  id: number;
  code: CultureCode;
  name: string;
  region?: string;
  religion?: string;
  physicalTraits?: string;
  restrictedTo?: string;
  skillBonuses?: Record<string, number>;
  expertiseDescription?: string;
  sampleNames?: string[];
  languages?: string[];
  description?: string;
}
