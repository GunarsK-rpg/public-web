import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useSwipeNavigation, type SwipeOptions } from './useSwipeNavigation';

// Type for addEventListener mock call arguments
type EventListenerCall = [string, EventListenerOrEventListenerObject, ...unknown[]];

// Mock Vue lifecycle hooks
const mountedCallbacks: (() => void)[] = [];
const unmountedCallbacks: (() => void)[] = [];

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: (cb: () => void) => mountedCallbacks.push(cb),
    onUnmounted: (cb: () => void) => unmountedCallbacks.push(cb),
  };
});

describe('useSwipeNavigation', () => {
  let mockElement: HTMLElement;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Clear lifecycle callbacks
    mountedCallbacks.length = 0;
    unmountedCallbacks.length = 0;

    // Create mock element
    mockElement = document.createElement('div');
    addEventListenerSpy = vi.spyOn(mockElement, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to create touch events
  const createTouchEvent = (type: string, clientX: number, clientY: number = 0): TouchEvent => {
    const touch = { clientX, clientY } as Touch;
    return {
      type,
      touches: type === 'touchstart' ? [touch] : [],
      changedTouches: [touch],
    } as unknown as TouchEvent;
  };

  // Helper to simulate the lifecycle and get handlers
  const setupSwipe = (options: SwipeOptions = {}) => {
    const targetRef = ref<HTMLElement | null>(mockElement);
    useSwipeNavigation(targetRef, options);

    // Simulate mounting
    mountedCallbacks.forEach((cb) => cb());

    return { targetRef };
  };

  // ========================================
  // Event Listener Registration
  // ========================================
  describe('event listener registration', () => {
    it('adds touch event listeners on mount', () => {
      setupSwipe();

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), {
        passive: true,
      });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), {
        passive: true,
      });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function), {
        passive: true,
      });
    });

    it('removes touch event listeners on unmount', () => {
      setupSwipe();

      // Simulate unmounting
      unmountedCallbacks.forEach((cb) => cb());

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
    });

    it('does not add listeners when element is null on mount', () => {
      const targetRef = ref<HTMLElement | null>(null);
      useSwipeNavigation(targetRef, {});

      mountedCallbacks.forEach((cb) => cb());

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('does not remove listeners when element is null on unmount', () => {
      const targetRef = ref<HTMLElement | null>(null);
      useSwipeNavigation(targetRef, {});

      mountedCallbacks.forEach((cb) => cb());
      unmountedCallbacks.forEach((cb) => cb());

      expect(removeEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Left Swipe Detection
  // ========================================
  describe('left swipe detection', () => {
    it('calls onSwipeLeft for left swipe exceeding threshold', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50 });

      // Get the registered handlers
      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Simulate swipe left: start at 200, end at 100 (deltaX = -100)
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 100, 0));

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('does not call onSwipeLeft for swipe below threshold', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe only 30px (below 50px threshold)
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 170, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('does not call onSwipeLeft for right swipe', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe right: start at 100, end at 200
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 200, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Right Swipe Detection
  // ========================================
  describe('right swipe detection', () => {
    it('calls onSwipeRight for right swipe exceeding threshold', () => {
      const onSwipeRight = vi.fn();
      setupSwipe({ onSwipeRight, threshold: 50 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe right: start at 100, end at 200 (deltaX = 100)
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 200, 0));

      expect(onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it('does not call onSwipeRight for swipe below threshold', () => {
      const onSwipeRight = vi.fn();
      setupSwipe({ onSwipeRight, threshold: 50 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe only 40px
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 140, 0));

      expect(onSwipeRight).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Vertical Movement Cancellation
  // ========================================
  describe('vertical movement cancellation', () => {
    it('cancels swipe when vertical movement exceeds maxVerticalDistance', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50, maxVerticalDistance: 100 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Large horizontal swipe but also large vertical movement
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 150)); // vertical delta = 150

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('allows swipe when vertical movement is within maxVerticalDistance', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50, maxVerticalDistance: 100 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Large horizontal swipe with acceptable vertical movement
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 50)); // vertical delta = 50

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('uses absolute value for vertical distance', () => {
      const onSwipeRight = vi.fn();
      setupSwipe({ onSwipeRight, threshold: 50, maxVerticalDistance: 100 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe right with upward vertical movement (negative delta)
      touchStartHandler(createTouchEvent('touchstart', 100, 100));
      touchEndHandler(createTouchEvent('touchend', 200, 50)); // vertical delta = -50 (abs = 50)

      expect(onSwipeRight).toHaveBeenCalled();
    });
  });

  // ========================================
  // Default Options
  // ========================================
  describe('default options', () => {
    it('uses default threshold of 50', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft }); // No threshold specified

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe 49px - should not trigger (below threshold)
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 51, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();

      // Swipe 50px - should trigger (at threshold, check is < so 50 >= 50 passes)
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('uses default maxVerticalDistance of 100', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft }); // No maxVerticalDistance specified

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Swipe with vertical distance of 101 - should not trigger
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 101));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Touch Cancel Handling
  // ========================================
  describe('touch cancel handling', () => {
    it('resets swiping state on touchcancel', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchCancelHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchcancel'
      )?.[1] as () => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Start swipe
      touchStartHandler(createTouchEvent('touchstart', 200, 0));

      // Cancel
      touchCancelHandler();

      // Try to end - should not trigger callback because swiping was cancelled
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles missing touch in touchstart', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // TouchEvent with empty touches array
      const emptyTouchStart = { touches: [] } as unknown as TouchEvent;
      touchStartHandler(emptyTouchStart);

      // Try to complete swipe
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('handles missing touch in touchend', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      touchStartHandler(createTouchEvent('touchstart', 200, 0));

      // TouchEvent with empty changedTouches array
      const emptyTouchEnd = { changedTouches: [] } as unknown as TouchEvent;
      touchEndHandler(emptyTouchEnd);

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('handles touchend without prior touchstart', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft });

      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Call touchend without touchstart
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('handles rapid successive swipes', () => {
      const onSwipeLeft = vi.fn();
      const onSwipeRight = vi.fn();
      setupSwipe({ onSwipeLeft, onSwipeRight });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // First swipe left
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      // Second swipe right
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 250, 0));

      // Third swipe left
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).toHaveBeenCalledTimes(2);
      expect(onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it('handles exact threshold value', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 50 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // Exactly 50px - SHOULD trigger (check is Math.abs < threshold, so 50 >= 50 passes)
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 50, 0));

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('works without any callbacks provided', () => {
      // Should not throw
      expect(() => {
        setupSwipe({});

        const touchStartHandler = addEventListenerSpy.mock.calls.find(
          (call: EventListenerCall) => call[0] === 'touchstart'
        )?.[1] as (e: TouchEvent) => void;
        const touchEndHandler = addEventListenerSpy.mock.calls.find(
          (call: EventListenerCall) => call[0] === 'touchend'
        )?.[1] as (e: TouchEvent) => void;

        touchStartHandler(createTouchEvent('touchstart', 200, 0));
        touchEndHandler(createTouchEvent('touchend', 50, 0));
      }).not.toThrow();
    });
  });

  // ========================================
  // Custom Threshold
  // ========================================
  describe('custom threshold', () => {
    it('respects custom threshold value', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 100 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // 80px swipe - below 100 threshold
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 120, 0));

      expect(onSwipeLeft).not.toHaveBeenCalled();

      // 101px swipe - above 100 threshold
      touchStartHandler(createTouchEvent('touchstart', 200, 0));
      touchEndHandler(createTouchEvent('touchend', 99, 0));

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('allows very small threshold', () => {
      const onSwipeLeft = vi.fn();
      setupSwipe({ onSwipeLeft, threshold: 10 });

      const touchStartHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchstart'
      )?.[1] as (e: TouchEvent) => void;
      const touchEndHandler = addEventListenerSpy.mock.calls.find(
        (call: EventListenerCall) => call[0] === 'touchend'
      )?.[1] as (e: TouchEvent) => void;

      // 11px swipe
      touchStartHandler(createTouchEvent('touchstart', 100, 0));
      touchEndHandler(createTouchEvent('touchend', 89, 0));

      expect(onSwipeLeft).toHaveBeenCalled();
    });
  });
});
