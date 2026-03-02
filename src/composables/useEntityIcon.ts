import { computed, type ComputedRef } from 'vue';
import { findById } from 'src/utils/arrayUtils';
import { getIconUrl, type IconType } from 'src/utils/iconUrl';

/**
 * Composable for resolving entity icons from classifier stores.
 * Eliminates duplication between EquipmentItem and ActionItem.
 *
 * @param entityId - Reactive ID of the entity
 * @param entities - Array of entities with id and icon properties
 * @param iconCategory - Icon category for URL resolution (e.g., 'equipment', 'actions')
 * @returns Object with entity and iconUrl computed refs
 */
export function useEntityIcon<T extends { id: number; icon?: string }>(
  entityId: ComputedRef<number | undefined>,
  entities: ComputedRef<T[]>,
  iconCategory: IconType
): {
  entity: ComputedRef<T | undefined>;
  iconUrl: ComputedRef<string>;
} {
  const entity = computed(() => findById(entities.value, entityId.value));

  const iconUrl = computed(() => getIconUrl(entity.value?.icon, iconCategory));

  return { entity, iconUrl };
}
