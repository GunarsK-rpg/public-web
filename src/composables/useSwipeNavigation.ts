import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export interface SwipeOptions {
  /** Minimum distance in pixels to trigger a swipe (default: 50) */
  threshold?: number;
  /** Maximum vertical distance before swipe is cancelled (default: 100) */
  maxVerticalDistance?: number;
  /** Callback when swiping left (next) */
  onSwipeLeft?: () => void;
  /** Callback when swiping right (previous) */
  onSwipeRight?: () => void;
}

/**
 * Composable for detecting horizontal swipe gestures on mobile
 *
 * @param targetRef - Ref to the DOM element to attach swipe listeners to
 * @param options - Configuration options for swipe behavior
 */
export function useSwipeNavigation(
  targetRef: Ref<HTMLElement | null>,
  options: SwipeOptions = {}
): void {
  const { threshold = 50, maxVerticalDistance = 100, onSwipeLeft, onSwipeRight } = options;

  const startX = ref(0);
  const startY = ref(0);
  const isSwiping = ref(false);

  function handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    startX.value = touch.clientX;
    startY.value = touch.clientY;
    isSwiping.value = true;
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (!isSwiping.value) return;
    isSwiping.value = false;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startX.value;
    const deltaY = Math.abs(touch.clientY - startY.value);

    // Cancel if vertical movement is too large (user is scrolling)
    if (deltaY > maxVerticalDistance) return;

    // Check if horizontal movement exceeds threshold
    if (Math.abs(deltaX) < threshold) return;

    if (deltaX < 0) {
      // Swipe left (next)
      onSwipeLeft?.();
    } else {
      // Swipe right (previous)
      onSwipeRight?.();
    }
  }

  function handleTouchCancel(): void {
    isSwiping.value = false;
  }

  onMounted(() => {
    const el = targetRef.value;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchCancel, { passive: true });
  });

  onUnmounted(() => {
    const el = targetRef.value;
    if (!el) return;

    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchend', handleTouchEnd);
    el.removeEventListener('touchcancel', handleTouchCancel);
  });
}
