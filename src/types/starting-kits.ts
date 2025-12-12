/**
 * Starting Kit Types
 * Equipment and resource bundles for character creation
 */

/**
 * Starting kit codes
 */
export type StartingKitCode =
  | 'academic'
  | 'artisan'
  | 'military'
  | 'courtier'
  | 'underworld'
  | 'prisoner';

/**
 * Equipment item in a starting kit
 */
export interface StartingKitEquipment {
  id: number;
  startingKitId: number;
  equipmentId: number;
  quantity: number;
}

/**
 * Expertise granted by a starting kit
 */
export interface StartingKitExpertise {
  id: number;
  startingKitId: number;
  expertiseId: number;
}

/**
 * Starting kit classifier
 */
export interface StartingKit {
  id: number;
  code: StartingKitCode;
  name: string;
  description: string;
  startingSpheres: string; // Dice formula like "3d12", "4d8", "0"
  equipment?: StartingKitEquipment[];
  expertises?: StartingKitExpertise[];
}

/**
 * Extended starting kit with resolved equipment and expertise names
 * Used for display purposes
 */
export interface StartingKitDisplay extends StartingKit {
  equipmentNames?: string[];
  expertiseNames?: string[];
  spheresAverage?: number; // Calculated average for display
}
