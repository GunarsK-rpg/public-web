/**
 * Hero's companion (hero_companions table)
 */
export interface HeroCompanion {
  id: number;
  heroId: number;
  compTypeId: number;
  description?: string;
  notes?: string;
}
