/** Turn phase options for combat phase toggle */
export const TURN_PHASES = [
  { label: 'Fast', value: 'fast' as const },
  { label: 'Slow', value: 'slow' as const },
];

export type TurnPhase = 'fast' | 'slow' | null;

/** NPC size options */
export const NPC_SIZES = [
  { label: 'Small', value: 'Small' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Large', value: 'Large' },
  { label: 'Huge', value: 'Huge' },
  { label: 'Gargantuan', value: 'Gargantuan' },
];
