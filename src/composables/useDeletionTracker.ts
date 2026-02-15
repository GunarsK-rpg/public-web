/**
 * Tracks sub-resource items removed from local state that have real DB IDs (> 0).
 * Temp IDs (< 0) are ignored — they were never persisted.
 *
 * Used by step components to record removals, then consumed by the save
 * composable to issue DELETE calls before advancing to the next step.
 */
export type DeletionTracker = ReturnType<typeof useDeletionTracker>;

export function useDeletionTracker() {
  const pending = new Map<string, Set<number>>();

  function trackDeletion(resource: string, id: number): void {
    if (id <= 0) return;
    if (!pending.has(resource)) {
      pending.set(resource, new Set());
    }
    pending.get(resource)!.add(id);
  }

  function getDeletions(resource: string): number[] {
    return Array.from(pending.get(resource) ?? []);
  }

  function clearDeletions(resource: string): void {
    pending.delete(resource);
  }

  function clearAll(): void {
    pending.clear();
  }

  return { trackDeletion, getDeletions, clearDeletions, clearAll };
}
