/**
 * App-wide Theme Constants
 *
 * This file provides TypeScript constants that map to Quasar theme colors.
 * Use these constants in templates instead of hardcoding color strings.
 *
 * These constants reference Quasar's color system which automatically
 * handles light/dark mode transitions.
 *
 * Usage in templates:
 *   :class="`bg-${COLORS.success}`"
 *   :class="`text-${COLORS.muted}`"
 */

/**
 * Semantic color names mapping to Quasar color classes
 * These work with bg-*, text-*, etc. Quasar utility classes
 */
export const COLORS = {
  // Status colors
  success: 'positive',
  error: 'negative',
  warning: 'warning',
  info: 'info',

  // Brand colors
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',

  // Neutral colors
  muted: 'grey',
  dark: 'dark',
  light: 'white',

  // Text colors (for use with text-* classes)
  textMuted: 'grey',
  textPrimary: 'dark',
  textSecondary: 'grey-7',
} as const;

/**
 * UI State colors for common patterns
 */
export const UI_STATES = {
  // Enabled/active states
  active: 'primary',
  selected: 'primary',
  highlight: 'accent',

  // Disabled/locked states
  disabled: 'grey',
  locked: 'grey',

  // Validation states
  valid: 'positive',
  invalid: 'negative',
  pending: 'warning',
} as const;

/**
 * Category colors for grouping/tagging
 * Use for badges, tags, category indicators
 */
export const CATEGORY_COLORS = {
  // Generic category colors
  category1: 'primary',
  category2: 'secondary',
  category3: 'accent',
  category4: 'positive',
  category5: 'warning',
  category6: 'info',

  // Specific use cases
  required: 'negative',
  optional: 'grey',
  recommended: 'positive',
  new: 'info',
  updated: 'warning',
} as const;

/**
 * RPG-specific semantic colors
 * Maps game concepts to theme colors
 */
export const RPG_COLORS = {
  // Talent/ability states
  talentAvailable: 'positive',
  talentLocked: 'grey',
  talentSelected: 'primary',
  talentKey: 'amber-8', // Key/signature talents - subdued gold

  // Path types
  heroicPath: 'blue-grey-8',
  radiantPath: 'amber-9',
  ancestryPath: 'teal-8',

  // Attribute types (for grouping)
  physical: 'positive',
  cognitive: 'info',
  spiritual: 'accent',

  // Resource indicators
  health: 'negative',
  focus: 'teal',
  investiture: 'amber',

  // Resource cost badges (for action costs)
  focusCost: 'teal',
  investitureCost: 'amber',

  // Banner backgrounds
  bannerInfo: 'amber-2',
  bannerInfoIcon: 'amber-8',

  // Currency/spheres
  currency: 'amber',

  // Equipment states
  equipmentPrimary: 'amber',

  // Singer-specific
  singerForm: 'purple',

  // Special ability text
  specialAbility: 'purple',

  // Muted badges (status indicators, source labels)
  badgeMuted: 'grey',
} as const;

/**
 * Opacity values for consistent transparency
 */
export const OPACITY = {
  disabled: 0.6,
  muted: 0.7,
  subtle: 0.5,
  faint: 0.3,
} as const;

// Type exports for TypeScript consumers
export type ColorKey = keyof typeof COLORS;
export type UIStateKey = keyof typeof UI_STATES;
export type CategoryColorKey = keyof typeof CATEGORY_COLORS;
export type RPGColorKey = keyof typeof RPG_COLORS;
