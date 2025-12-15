// Re-export all classifier data from split files
export { attributeTypes, attributes } from './attributes';
export { derivedStats, derivedStatValues } from './derivedStats';
export { skills } from './skills';
export { expertiseTypes, expertises } from './expertises';
export { activationTypes, actionTypes, actions, actionLinks } from './actions';
export { paths, specialties } from './paths';
export { surges } from './surges';
export { radiantOrders } from './radiantOrders';
export { singerForms } from './singerForms';
export { talents } from './talents';
export { units } from './units';
export { equipmentAttributes, equipmentAttributeMaps } from './equipmentAttributes';
export { equipmentTypes, damageTypes, equipment } from './equipments';
export { conditions, injuries } from './conditions';
export { goalStatuses, connectionTypes } from './goals';
export { companionTypes } from './companionTypes';
export { startingKits } from './startingKits';
export { ancestries } from './ancestries';
export { cultures } from './cultures';
export { tiers } from './tiers';
export { levels } from './levels';

// Import for the combined classifiers object
import { attributeTypes, attributes } from './attributes';
import { derivedStats, derivedStatValues } from './derivedStats';
import { skills } from './skills';
import { expertiseTypes, expertises } from './expertises';
import { activationTypes, actionTypes, actions, actionLinks } from './actions';
import { paths, specialties } from './paths';
import { surges } from './surges';
import { radiantOrders } from './radiantOrders';
import { singerForms } from './singerForms';
import { talents } from './talents';
import { units } from './units';
import { equipmentAttributes, equipmentAttributeMaps } from './equipmentAttributes';
import { equipmentTypes, damageTypes, equipment } from './equipments';
import { conditions, injuries } from './conditions';
import { goalStatuses, connectionTypes } from './goals';
import { companionTypes } from './companionTypes';
import { startingKits } from './startingKits';
import { ancestries } from './ancestries';
import { cultures } from './cultures';
import { tiers } from './tiers';
import { levels } from './levels';

export const classifiers = {
  // Attributes & Stats
  attributeTypes,
  attributes,
  derivedStats,
  derivedStatValues,

  // Skills & Expertises
  skills,
  expertiseTypes,
  expertises,

  // Actions
  activationTypes,
  actionTypes,
  actions,
  actionLinks,

  // Paths & Talents
  paths,
  specialties,
  surges,
  radiantOrders,
  singerForms,
  talents,

  // Equipment
  units,
  equipmentTypes,
  damageTypes,
  equipmentAttributes,
  equipmentAttributeMaps,
  equipment,

  // Conditions & Status
  conditions,
  injuries,

  // Character Details
  goalStatuses,
  connectionTypes,
  companionTypes,

  // Starting & Ancestry
  startingKits,
  ancestries,
  cultures,

  // Progression
  tiers,
  levels,
};

export default classifiers;
