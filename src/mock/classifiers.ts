// Re-export all classifier data from split files
export { attributes } from './attributes';
export { skills } from './skills';
export { weapons, armor, equipment } from './equipment';
export { conditions } from './conditions';
export { expertises } from './expertises';
export { origins } from './origins';
export { heroicPaths, specialties } from './paths';
export { radiantOrders, surges } from './radiant';
export { talents } from './talents';
export { ancestries, singerForms, cultures } from './ancestry';

// Import for the combined classifiers object
import { attributes } from './attributes';
import { skills } from './skills';
import { weapons, armor, equipment } from './equipment';
import { conditions } from './conditions';
import { expertises } from './expertises';
import { origins } from './origins';
import { heroicPaths, specialties } from './paths';
import { radiantOrders, surges } from './radiant';
import { talents } from './talents';
import { ancestries, singerForms, cultures } from './ancestry';

export const classifiers = {
  attributes,
  skills,
  weapons,
  armor,
  equipment,
  conditions,
  expertises,
  origins,
  heroicPaths,
  specialties,
  radiantOrders,
  surges,
  talents,
  ancestries,
  singerForms,
  cultures,
};

export default classifiers;
