import type { Classifier } from './classifier';

/**
 * Equipment item in a starting kit (cl_starting_kit_equipment)
 */
export interface StartingKitEquipment {
  id: number;
  startingKitId: number;
  equipmentId: number;
  quantity: number;
}

/**
 * Expertise granted by a starting kit (cl_starting_kit_expertises)
 */
export interface StartingKitExpertise {
  id: number;
  startingKitId: number;
  expertiseId: number;
}

/**
 * Starting kit classifier (cl_starting_kits)
 */
export interface StartingKit extends Classifier {
  startingSpheres: string;
  equipment?: StartingKitEquipment[];
  expertises?: StartingKitExpertise[];
}
