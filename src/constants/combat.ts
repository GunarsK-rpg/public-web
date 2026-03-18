/** Turn phase options for combat phase toggle */
export const TURN_PHASES = [
  { label: 'Fast', value: 'fast' as const },
  { label: 'Slow', value: 'slow' as const },
];

export type TurnPhase = 'fast' | 'slow' | null;
