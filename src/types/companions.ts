/**
 * Hero's companion
 */
export interface HeroCompanion {
  id: number;
  heroId: number;
  compTypeId: number;
  description?: string;
  notes?: string;
}
