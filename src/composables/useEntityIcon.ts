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

/**
 * Composable for resolving entity icons with a chained lookup.
 * Useful when the icon is on a related entity (e.g., equipment -> equipmentType).
 *
 * @param primaryEntityId - Reactive ID of the primary entity
 * @param primaryEntities - Array of primary entities
 * @param getRelatedId - Function to extract related entity ID from primary
 * @param relatedEntities - Array of related entities with icon
 * @param iconCategory - Icon category for URL resolution
 * @returns Object with primary entity, related entity, and iconUrl computed refs
 */
export function useChainedEntityIcon<
  P extends { id: number },
  R extends { id: number; icon?: string },
>(
  primaryEntityId: ComputedRef<number | undefined>,
  primaryEntities: ComputedRef<P[]>,
  getRelatedId: (primary: P) => number | undefined,
  relatedEntities: ComputedRef<R[]>,
  iconCategory: IconType
): {
  primaryEntity: ComputedRef<P | undefined>;
  relatedEntity: ComputedRef<R | undefined>;
  iconUrl: ComputedRef<string>;
} {
  const primaryEntity = computed(() => findById(primaryEntities.value, primaryEntityId.value));

  const relatedEntity = computed(() => {
    if (!primaryEntity.value) return undefined;
    const relatedId = getRelatedId(primaryEntity.value);
    return findById(relatedEntities.value, relatedId);
  });

  const iconUrl = computed(() => getIconUrl(relatedEntity.value?.icon, iconCategory));

  return { primaryEntity, relatedEntity, iconUrl };
}
