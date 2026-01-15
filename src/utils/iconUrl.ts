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
 * Lookup map for O(1) icon type to modules mapping
 */
const iconModules: Record<IconType, Record<string, string>> = {
  actions: actionIcons,
  equipment: equipmentIcons,
};

/**
 * Factory function to create getIconUrl with custom modules (for testing)
 * @param modules - Icon modules map by type
 * @returns getIconUrl function
 */
export function createGetIconUrl(
  modules: Record<IconType, Record<string, string>>
): (iconName: string | undefined, iconType: IconType) => string {
  return (iconName: string | undefined, iconType: IconType): string => {
    if (!iconName) return '';

    const typeModules = modules[iconType];
    if (!typeModules) return '';

    const key = `../assets/icons/${iconType}/${iconName}`;
    return typeModules[key] ?? '';
  };
}

/**
 * Get icon URL from icon name and type
 * @param iconName - Icon filename (e.g., 'action.svg')
 * @param iconType - Icon type/subfolder (e.g., 'actions')
 * @returns Full URL to the icon or empty string if not found
 */
export const getIconUrl = createGetIconUrl(iconModules);
