import { describe, it, expect, beforeEach } from 'vitest';
import { useDeletionTracker } from './useDeletionTracker';

describe('useDeletionTracker', () => {
  let tracker: ReturnType<typeof useDeletionTracker>;

  beforeEach(() => {
    tracker = useDeletionTracker();
  });

  // ========================================
  // trackDeletion
  // ========================================
  describe('trackDeletion', () => {
    it('tracks a real DB ID', () => {
      tracker.trackDeletion('cultures', 5);

      expect(tracker.getDeletions('cultures')).toEqual([5]);
    });

    it('tracks multiple IDs for the same resource', () => {
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('cultures', 10);

      expect(tracker.getDeletions('cultures')).toEqual([5, 10]);
    });

    it('tracks IDs across different resources', () => {
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('talents', 8);

      expect(tracker.getDeletions('cultures')).toEqual([5]);
      expect(tracker.getDeletions('talents')).toEqual([8]);
    });

    it('ignores temp IDs (negative)', () => {
      tracker.trackDeletion('cultures', -1);
      tracker.trackDeletion('cultures', -5);

      expect(tracker.getDeletions('cultures')).toEqual([]);
    });

    it('ignores zero ID', () => {
      tracker.trackDeletion('cultures', 0);

      expect(tracker.getDeletions('cultures')).toEqual([]);
    });

    it('deduplicates same ID', () => {
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('cultures', 5);

      expect(tracker.getDeletions('cultures')).toEqual([5]);
    });
  });

  // ========================================
  // getDeletions
  // ========================================
  describe('getDeletions', () => {
    it('returns empty array for untracked resource', () => {
      expect(tracker.getDeletions('unknown')).toEqual([]);
    });

    it('returns copy (not the internal set)', () => {
      tracker.trackDeletion('cultures', 5);
      const result = tracker.getDeletions('cultures');
      result.push(999);

      expect(tracker.getDeletions('cultures')).toEqual([5]);
    });
  });

  // ========================================
  // clearDeletions
  // ========================================
  describe('clearDeletions', () => {
    it('clears deletions for a specific resource', () => {
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('talents', 8);

      tracker.clearDeletions('cultures');

      expect(tracker.getDeletions('cultures')).toEqual([]);
      expect(tracker.getDeletions('talents')).toEqual([8]);
    });

    it('does nothing for untracked resource', () => {
      tracker.clearDeletions('unknown');

      expect(tracker.getDeletions('unknown')).toEqual([]);
    });
  });

  // ========================================
  // clearAll
  // ========================================
  describe('clearAll', () => {
    it('clears all tracked deletions', () => {
      tracker.trackDeletion('cultures', 5);
      tracker.trackDeletion('talents', 8);
      tracker.trackDeletion('equipment', 12);

      tracker.clearAll();

      expect(tracker.getDeletions('cultures')).toEqual([]);
      expect(tracker.getDeletions('talents')).toEqual([]);
      expect(tracker.getDeletions('equipment')).toEqual([]);
    });
  });
});
