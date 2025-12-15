import type { EquipmentAttribute, EquipmentAttributeMap } from 'src/types';

export const equipmentAttributes: EquipmentAttribute[] = [
  { id: 1, code: 'accurate', name: 'Accurate' },
  { id: 2, code: 'area', name: 'Area' },
  { id: 3, code: 'blocking', name: 'Blocking' },
  { id: 4, code: 'brutal', name: 'Brutal' },
  { id: 5, code: 'cumbersome', name: 'Cumbersome' },
  { id: 6, code: 'dangerous', name: 'Dangerous' },
  { id: 7, code: 'defensive', name: 'Defensive' },
  { id: 8, code: 'disarming', name: 'Disarming' },
  { id: 9, code: 'entangling', name: 'Entangling' },
  { id: 10, code: 'loaded', name: 'Loaded' },
  { id: 11, code: 'loud', name: 'Loud' },
  { id: 12, code: 'noisy', name: 'Noisy' },
  { id: 13, code: 'offhand', name: 'Offhand' },
  { id: 14, code: 'paired', name: 'Paired' },
  { id: 15, code: 'pierce', name: 'Pierce' },
  { id: 16, code: 'ranged', name: 'Ranged' },
  { id: 17, code: 'reach', name: 'Reach' },
  { id: 18, code: 'thrown', name: 'Thrown' },
  { id: 19, code: 'two-handed', name: 'Two-Handed' },
  { id: 20, code: 'unique', name: 'Unique' },
  { id: 21, code: 'unwieldy', name: 'Unwieldy' },
];

export const equipmentAttributeMaps: EquipmentAttributeMap[] = [
  { id: 1, equipmentId: 1, attributeId: 13 }, // knife - offhand
  { id: 2, equipmentId: 1, attributeId: 18 }, // knife - thrown
  { id: 3, equipmentId: 2, attributeId: 3 }, // longsword - blocking
  { id: 4, equipmentId: 3, attributeId: 17 }, // longspear - reach
  { id: 5, equipmentId: 3, attributeId: 19 }, // longspear - two-handed
  { id: 6, equipmentId: 4, attributeId: 20 }, // shardblade - unique
  { id: 7, equipmentId: 4, attributeId: 19 }, // shardblade - two-handed
];
