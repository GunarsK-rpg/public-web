/** Hero note - upsert payload */
export interface HeroNoteBase {
  id?: number;
  heroId: number;
  content: string;
}

/** Hero note - API response */
export interface HeroNote extends HeroNoteBase {
  id: number;
}
