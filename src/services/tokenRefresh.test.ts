import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosInstance } from 'axios';

const { mockAuthApiPost, mockBroadcastRefresh } = vi.hoisted(() => ({
  mockAuthApiPost: vi.fn(),
  mockBroadcastRefresh: vi.fn(),
}));

vi.mock('src/services/authApi', () => ({
  authApi: { post: mockAuthApiPost },
}));

vi.mock('src/services/authChannel', () => ({
  broadcastRefresh: mockBroadcastRefresh,
}));

import {
  refreshToken,
  scheduleProactiveRefresh,
  clearProactiveRefresh,
  setAuthFailureCallback,
  add401Interceptor,
} from './tokenRefresh';

describe('tokenRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    clearProactiveRefresh();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ========================================
  // refreshToken
  // ========================================
  describe('refreshToken', () => {
    it('returns true on successful refresh', async () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      const result = await refreshToken();

      expect(result).toBe(true);
      expect(mockAuthApiPost).toHaveBeenCalledWith('/refresh');
    });

    it('schedules next refresh on success', async () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      await refreshToken();

      expect(mockBroadcastRefresh).toHaveBeenCalledWith(3600);
    });

    it('returns false on failure', async () => {
      mockAuthApiPost.mockRejectedValue(new Error('Network error'));

      const result = await refreshToken();

      expect(result).toBe(false);
    });

    it('calls auth failure callback on error', async () => {
      const callback = vi.fn();
      setAuthFailureCallback(callback);
      mockAuthApiPost.mockRejectedValue(new Error('Network error'));

      await refreshToken();

      expect(callback).toHaveBeenCalled();
    });

    it('does not schedule refresh when expires_in is 0', async () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 0 } });

      await refreshToken();

      expect(mockBroadcastRefresh).not.toHaveBeenCalled();
    });

    it('queues concurrent callers and resolves all on success', async () => {
      let resolveRefresh: (v: unknown) => void;
      mockAuthApiPost.mockReturnValue(
        new Promise((r) => {
          resolveRefresh = r;
        })
      );

      const first = refreshToken();
      const second = refreshToken();
      const third = refreshToken();

      resolveRefresh!({ data: { expires_in: 3600 } });

      const results = await Promise.all([first, second, third]);
      expect(results).toEqual([true, true, true]);
      expect(mockAuthApiPost).toHaveBeenCalledTimes(1);
    });

    it('queues concurrent callers and resolves all on failure', async () => {
      let rejectRefresh: (e: Error) => void;
      mockAuthApiPost.mockReturnValue(
        new Promise((_, r) => {
          rejectRefresh = r;
        })
      );

      const first = refreshToken();
      const second = refreshToken();

      rejectRefresh!(new Error('fail'));

      const results = await Promise.all([first, second]);
      expect(results).toEqual([false, false]);
    });
  });

  // ========================================
  // scheduleProactiveRefresh
  // ========================================
  describe('scheduleProactiveRefresh', () => {
    it('schedules refresh before token expiry', () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      scheduleProactiveRefresh(3600);

      // Should not have called yet
      expect(mockAuthApiPost).not.toHaveBeenCalled();

      // Advance past the scheduled time (3600 - 60 buffer + jitter, min 10s)
      vi.advanceTimersByTime(3600 * 1000);

      expect(mockAuthApiPost).toHaveBeenCalled();
    });

    it('enforces minimum delay of 10 seconds', () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      scheduleProactiveRefresh(5); // Very short TTL

      vi.advanceTimersByTime(9_000);
      expect(mockAuthApiPost).not.toHaveBeenCalled();

      vi.advanceTimersByTime(30_000);
      expect(mockAuthApiPost).toHaveBeenCalled();
    });

    it('clears previous timer when rescheduled', () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      scheduleProactiveRefresh(3600);
      scheduleProactiveRefresh(7200);

      // Advance past when first schedule would have fired
      vi.advanceTimersByTime(3600 * 1000);

      // First timer was cancelled, second hasn't fired yet (7200 - 60 + jitter)
      expect(mockAuthApiPost).not.toHaveBeenCalled();

      // Advance to cover the second timer
      vi.advanceTimersByTime(7200 * 1000);
      expect(mockAuthApiPost).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // clearProactiveRefresh
  // ========================================
  describe('clearProactiveRefresh', () => {
    it('cancels scheduled refresh', () => {
      mockAuthApiPost.mockResolvedValue({ data: { expires_in: 3600 } });

      scheduleProactiveRefresh(3600);
      clearProactiveRefresh();

      vi.advanceTimersByTime(3600 * 1000);
      expect(mockAuthApiPost).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // add401Interceptor
  // ========================================
  describe('add401Interceptor', () => {
    it('registers interceptor on axios instance', () => {
      const mockUse = vi.fn();
      const instance = {
        interceptors: {
          response: { use: mockUse },
        },
      } as unknown as AxiosInstance;

      add401Interceptor(instance);

      expect(mockUse).toHaveBeenCalledTimes(1);
    });

    it('does not double-register on same instance', () => {
      const mockUse = vi.fn();
      const instance = {
        interceptors: {
          response: { use: mockUse },
        },
      } as unknown as AxiosInstance;

      add401Interceptor(instance);
      add401Interceptor(instance);

      expect(mockUse).toHaveBeenCalledTimes(1);
    });
  });
});
