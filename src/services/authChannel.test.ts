import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type * as AuthChannelModule from './authChannel';

// Must re-import fresh each test to reset module state
let authChannel: typeof AuthChannelModule;

describe('authChannel', () => {
  let mockInstance: {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockInstance = {
      onmessage: null,
      postMessage: vi.fn(),
      close: vi.fn(),
    };
    globalThis.BroadcastChannel = vi.fn(function () {
      return mockInstance;
    }) as unknown as typeof BroadcastChannel;

    // Fresh module import to reset internal channel state
    vi.resetModules();
    authChannel = await import('./authChannel');
  });

  afterEach(() => {
    authChannel.closeAuthChannel();
  });

  describe('initAuthChannel', () => {
    it('creates a BroadcastChannel named auth', () => {
      authChannel.initAuthChannel(vi.fn());
      expect(globalThis.BroadcastChannel).toHaveBeenCalledWith('auth');
    });

    it('wires onmessage to call handler with event data', () => {
      const handler = vi.fn();
      authChannel.initAuthChannel(handler);

      const event = new MessageEvent('message', { data: { type: 'logout' } });
      mockInstance.onmessage!(event);

      expect(handler).toHaveBeenCalledWith({ type: 'logout' });
    });

    it('is a no-op when BroadcastChannel is unavailable', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).BroadcastChannel;
      vi.resetModules();
      authChannel = await import('./authChannel');

      const handler = vi.fn();
      authChannel.initAuthChannel(handler);
      authChannel.broadcastLogin();
      authChannel.broadcastLogout();
      // No errors thrown
    });
  });

  describe('broadcastLogin', () => {
    it('posts login message to channel', () => {
      authChannel.initAuthChannel(vi.fn());
      authChannel.broadcastLogin();
      expect(mockInstance.postMessage).toHaveBeenCalledWith({ type: 'login' });
    });

    it('is a no-op before init', () => {
      authChannel.broadcastLogin();
      expect(mockInstance.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('broadcastLogout', () => {
    it('posts logout message to channel', () => {
      authChannel.initAuthChannel(vi.fn());
      authChannel.broadcastLogout();
      expect(mockInstance.postMessage).toHaveBeenCalledWith({ type: 'logout' });
    });
  });

  describe('closeAuthChannel', () => {
    it('closes the channel', () => {
      authChannel.initAuthChannel(vi.fn());
      authChannel.closeAuthChannel();
      expect(mockInstance.close).toHaveBeenCalled();
    });

    it('makes subsequent broadcasts a no-op', () => {
      authChannel.initAuthChannel(vi.fn());
      authChannel.closeAuthChannel();
      authChannel.broadcastLogin();
      expect(mockInstance.postMessage).not.toHaveBeenCalled();
    });
  });
});
