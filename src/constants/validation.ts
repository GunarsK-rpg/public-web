/**
 * Validation Constants
 *
 * Max lengths and bounds for form fields (match database constraints).
 */

// Text field limits (match database varchar/text constraints)
export const MAX_NAME_LENGTH = 255;
export const MAX_TEXT_LENGTH = 10000;

// Attribute bounds
export const MIN_ATTRIBUTE_VALUE = 0;
export const MAX_ATTRIBUTE_VALUE = 10;

// Skill modifier bounds (match SkillsStep UI: -10 to 10)
export const MIN_SKILL_MODIFIER = -10;
export const MAX_SKILL_MODIFIER = 10;

// Equipment bounds
export const MAX_EQUIPMENT_STACK = 999;
export const INDIVIDUAL_EQUIPMENT_TYPES = ['weapon', 'armor', 'fabrial'];

// Campaign bounds (match database constraints)
export const MAX_CAMPAIGN_NAME_LENGTH = 100;
export const MIN_CAMPAIGN_MODIFIER = -100;
export const MAX_CAMPAIGN_MODIFIER = 100;
