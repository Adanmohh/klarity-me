import { useRef, useEffect, useState, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface SwipeConfig {
  threshold?: number; // Minimum distance for swipe
  velocity?: number; // Minimum velocity for swipe
  longPressDelay?: number; // Time for long press
  doubleTapDelay?: number; // Max time between taps for double tap
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = config;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setTouchEnd(null);

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.();
        // Prevent other gestures after long press
        setTouchStart(null);
      }, longPressDelay);
    }
  }, [handlers, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Cancel long press if user moves finger
    if ((deltaX > 10 || deltaY > 10) && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
    });
  }, [touchStart]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const endTime = Date.now();
    const touchDuration = endTime - touchStart.time;

    // If no movement, check for tap or double tap
    if (!touchEnd) {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTap;

      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap detected
        handlers.onDoubleTap?.();
        setLastTap(0); // Reset to prevent triple tap
      } else {
        // Single tap
        handlers.onTap?.();
        setLastTap(currentTime);
      }
      
      setTouchStart(null);
      return;
    }

    // Calculate swipe distance and velocity
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocityX = absX / touchDuration;
    const velocityY = absY / touchDuration;

    // Determine if it's a swipe
    const isHorizontalSwipe = absX > absY && absX > threshold && velocityX > velocity;
    const isVerticalSwipe = absY > absX && absY > threshold && velocityY > velocity;

    if (isHorizontalSwipe) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    } else if (touchDuration < 200) {
      // Quick tap without significant movement
      handlers.onTap?.();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, lastTap, handlers, threshold, velocity, doubleTapDelay]);

  const handleTouchCancel = useCallback(() => {
    // Clear any pending timers and reset state
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTouchStart(null);
    setTouchEnd(null);
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return elementRef;
}

// Hook for card swipe gestures
export function useCardSwipeGestures(
  onComplete?: () => void,
  onArchive?: () => void,
  onActivate?: () => void,
  onExpand?: () => void
) {
  return useSwipeGesture({
    onSwipeRight: onComplete,
    onSwipeLeft: onArchive,
    onSwipeUp: onActivate,
    onDoubleTap: onExpand,
  });
}

// Hook for navigation drawer
export function useDrawerSwipeGesture(
  isOpen: boolean,
  onOpen: () => void,
  onClose: () => void
) {
  return useSwipeGesture({
    onSwipeRight: isOpen ? undefined : onOpen,
    onSwipeLeft: isOpen ? onClose : undefined,
  });
}

// Hook for carousel/gallery swipe
export function useCarouselSwipeGesture(
  onNext: () => void,
  onPrevious: () => void
) {
  return useSwipeGesture({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });
}

// Pinch to zoom gesture
export function usePinchToZoom(
  onZoomIn?: () => void,
  onZoomOut?: () => void
) {
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        setInitialDistance(distance);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        const scale = currentDistance / initialDistance;
        
        if (scale > 1.2) {
          onZoomIn?.();
          setInitialDistance(currentDistance); // Reset to prevent multiple triggers
        } else if (scale < 0.8) {
          onZoomOut?.();
          setInitialDistance(currentDistance); // Reset to prevent multiple triggers
        }
      }
    };

    const handleTouchEnd = () => {
      setInitialDistance(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [initialDistance, onZoomIn, onZoomOut]);

  return elementRef;
}