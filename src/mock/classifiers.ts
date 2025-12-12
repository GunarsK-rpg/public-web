// Re-export all classifier data from split files
export { attributes } from './attributes';
export { skills } from './skills';
export { weapons, armor, equipment } from './equipment';
export { conditions } from './conditions';
export { expertises } from './expertises';
export { startingKits } from './starting-kits';
export { heroicPaths, specialties } from './paths';
export { radiantOrders, surges } from './radiant';
export { talents } from './talents';
export { ancestries, singerForms, cultures } from './ancestry';
export { activationTypes, actionTypes, actions } from './actions';
export {
  derivedStats,
  liftCapacityTable,
  carryCapacityTable,
  movementTable,
  recoveryDieTable,
  sensesRangeTable,
  unarmedDamageTable,
} from './derived-stats';
export { goalStatuses, connectionTypes, companionTypes } from './type-classifiers';

// Import for the combined classifiers object
import { attributes } from './attributes';
import { skills } from './skills';
import { weapons, armor, equipment } from './equipment';
import { conditions } from './conditions';
import { expertises } from './expertises';
import { startingKits } from './starting-kits';
import { heroicPaths, specialties } from './paths';
import { radiantOrders, surges } from './radiant';
import { talents } from './talents';
import { ancestries, singerForms, cultures } from './ancestry';
import { activationTypes, actionTypes, actions } from './actions';
import { derivedStats } from './derived-stats';
import { goalStatuses, connectionTypes, companionTypes } from './type-classifiers';

export const classifiers = {
  attributes,
  skills,
  weapons,
  armor,
  equipment,
  conditions,
  expertises,
  startingKits,
  heroicPaths,
  specialties,
  radiantOrders,
  surges,
  talents,
  ancestries,
  singerForms,
  cultures,
  activationTypes,
  actionTypes,
  actions,
  derivedStats,
  goalStatuses,
  connectionTypes,
  companionTypes,
};

export default classifiers;
