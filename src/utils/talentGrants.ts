import type { SpecialEntry } from 'src/types';

export function filterSpecial(special: SpecialEntry[], ...types: string[]): SpecialEntry[] {
  return special.filter((s) => types.includes(s.type) && s.codes?.length);
}

export function extractCodes(special: SpecialEntry[], ...types: string[]): string[] {
  return filterSpecial(special, ...types).flatMap((s) => s.codes!);
}
