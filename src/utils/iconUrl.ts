/**
 * Icon type determines the subfolder in assets/icons/
 */
export type IconType = 'actions' | 'equipment';

/**
 * Icon module cache for dynamic imports
 * Uses relative paths from this file's location (src/utils/)
 */
const actionIcons: Record<string, string> = import.meta.glob('../assets/icons/actions/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const equipmentIcons: Record<string, string> = import.meta.glob('../assets/icons/equipment/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * Get icon URL from icon name and type
 * @param iconName - Icon filename (e.g., 'action.svg')
 * @param iconType - Icon type/subfolder (e.g., 'actions')
 * @returns Full URL to the icon or empty string if not found
 */
export function getIconUrl(iconName: string | undefined, iconType: IconType): string {
  if (!iconName) return '';

  const modules = iconType === 'actions' ? actionIcons : equipmentIcons;
  const key = `../assets/icons/${iconType}/${iconName}`;

  return modules[key] ?? '';
}
