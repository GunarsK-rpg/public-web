import type { StartingKit } from 'src/types';

/**
 * Starting Kits - Equipment and resource bundles for character creation.
 * Based on official handbook starting kits.
 */
export const startingKits: StartingKit[] = [
  {
    id: 1,
    code: 'academic',
    name: 'Academic Kit',
    description:
      'For scholars and students. One knife/sling/staff, uniform, backpack with writing supplies, book, weak poison. Grants Literature expertise.',
    startingSpheres: '3d12',
    equipment: [
      { id: 1, startingKitId: 1, equipmentId: 1, quantity: 1 }, // knife (or sling/staff - player choice)
      { id: 2, startingKitId: 1, equipmentId: 17, quantity: 1 }, // uniform
      { id: 3, startingKitId: 1, equipmentId: 12, quantity: 1 }, // backpack
      { id: 4, startingKitId: 1, equipmentId: 15, quantity: 1 }, // common clothing
      { id: 5, startingKitId: 1, equipmentId: 28, quantity: 1 }, // ink pen
      { id: 6, startingKitId: 1, equipmentId: 29, quantity: 1 }, // ink bottle
      { id: 7, startingKitId: 1, equipmentId: 30, quantity: 1 }, // paper (10 sheets)
      { id: 8, startingKitId: 1, equipmentId: 31, quantity: 3 }, // empty vials
      { id: 9, startingKitId: 1, equipmentId: 32, quantity: 1 }, // wax block
      { id: 10, startingKitId: 1, equipmentId: 19, quantity: 1 }, // book
      { id: 11, startingKitId: 1, equipmentId: 36, quantity: 1 }, // weak poison
    ],
    expertises: [{ id: 1, startingKitId: 1, expertiseId: 35 }], // Literature
  },
  {
    id: 2,
    code: 'artisan',
    name: 'Artisan Kit',
    description:
      'For craftspeople and healers. Hammer or light weapon, leather armor, chest with supplies and antiseptic.',
    startingSpheres: '4d8',
    equipment: [
      { id: 12, startingKitId: 2, equipmentId: 11, quantity: 1 }, // hammer
      { id: 13, startingKitId: 2, equipmentId: 5, quantity: 1 }, // leather armor
      { id: 14, startingKitId: 2, equipmentId: 22, quantity: 1 }, // chest
      { id: 15, startingKitId: 2, equipmentId: 15, quantity: 1 }, // common clothing
      { id: 16, startingKitId: 2, equipmentId: 20, quantity: 1 }, // toolkit (surgical supplies)
      { id: 17, startingKitId: 2, equipmentId: 34, quantity: 1 }, // weak antiseptic (5 doses)
      { id: 18, startingKitId: 2, equipmentId: 28, quantity: 1 }, // ink pen
      { id: 19, startingKitId: 2, equipmentId: 29, quantity: 1 }, // ink bottle
    ],
    expertises: [],
  },
  {
    id: 3,
    code: 'military',
    name: 'Military Kit',
    description:
      'For soldiers and guards. Two non-special weapons, uniform, chain armor, backpack with rations.',
    startingSpheres: '2d6',
    equipment: [
      { id: 20, startingKitId: 3, equipmentId: 17, quantity: 1 }, // uniform
      { id: 21, startingKitId: 3, equipmentId: 6, quantity: 1 }, // chain mail
      { id: 22, startingKitId: 3, equipmentId: 12, quantity: 1 }, // backpack
      { id: 23, startingKitId: 3, equipmentId: 15, quantity: 1 }, // common clothing
      { id: 24, startingKitId: 3, equipmentId: 14, quantity: 1 }, // waterskin
      { id: 25, startingKitId: 3, equipmentId: 23, quantity: 1 }, // bedroll/blanket
      { id: 26, startingKitId: 3, equipmentId: 33, quantity: 10 }, // rations (10 days)
    ],
    expertises: [],
  },
  {
    id: 4,
    code: 'courtier',
    name: 'Courtier Kit',
    description:
      'For nobles and diplomats. One sword or longbow, fine clothing, alcohol. Has patron connection.',
    startingSpheres: '4d20',
    equipment: [
      { id: 27, startingKitId: 4, equipmentId: 16, quantity: 1 }, // fine clothing
    ],
    expertises: [],
  },
  {
    id: 5,
    code: 'underworld',
    name: 'Underworld Kit',
    description:
      'For rogues and criminals. Two light weapons, leather armor, backpack with lockpicks, rope, lantern.',
    startingSpheres: '1d20',
    equipment: [
      { id: 28, startingKitId: 5, equipmentId: 5, quantity: 1 }, // leather armor
      { id: 29, startingKitId: 5, equipmentId: 12, quantity: 1 }, // backpack
      { id: 30, startingKitId: 5, equipmentId: 15, quantity: 1 }, // common clothing
      { id: 31, startingKitId: 5, equipmentId: 25, quantity: 1 }, // lockpicks
      { id: 32, startingKitId: 5, equipmentId: 13, quantity: 1 }, // rope
      { id: 33, startingKitId: 5, equipmentId: 21, quantity: 1 }, // lantern
      { id: 34, startingKitId: 5, equipmentId: 33, quantity: 5 }, // rations (5 days street food)
    ],
    expertises: [],
  },
  {
    id: 6,
    code: 'prisoner',
    name: 'Prisoner Kit',
    description:
      'For those starting with nothing. Manacles and ragged clothing. Has connection to a Radiant spren.',
    startingSpheres: '0',
    equipment: [
      { id: 35, startingKitId: 6, equipmentId: 26, quantity: 1 }, // manacles
      { id: 36, startingKitId: 6, equipmentId: 27, quantity: 1 }, // ragged clothing
    ],
    expertises: [],
  },
];

/**
 * Helper to get starting kit by code
 */
export function getStartingKitByCode(code: string): StartingKit | undefined {
  return startingKits.find((k) => k.code === code);
}

/**
 * Helper to calculate average spheres from dice formula
 * e.g., "3d12" -> 19.5, "4d8" -> 18, "0" -> 0
 */
export function calculateAverageSpheres(formula: string): number {
  if (formula === '0') return 0;

  const match = formula.match(/^(\d+)d(\d+)$/);
  if (!match || !match[1] || !match[2]) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  return count * ((sides + 1) / 2);
}
