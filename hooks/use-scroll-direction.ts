"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down" | "top";

interface UseScrollDirectionOptions {
  /** Minimum px scrolled before direction changes (prevents flicker). Default: 10 */
  threshold?: number;
  /** Element to observe. Defaults to window. */
  target?: React.RefObject<HTMLElement | null>;
}

/**
 * Tracks scroll direction for progressive header hide/show.
 *
 * Returns:
 *   "top"  — at the very top of the page (< threshold from top)
 *   "up"   — scrolling upward → header should be visible
 *   "down" — scrolling downward → header should be hidden
 */
export function useScrollDirection({
  threshold = 10,
  target,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("top");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const getScrollY = () =>
      target?.current ? target.current.scrollTop : window.scrollY;

    function onScroll() {
      if (ticking.current) return;

      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = getScrollY();
        const diff = currentY - lastScrollY.current;

        if (currentY < threshold) {
          setDirection("top");
        } else if (diff > threshold) {
          setDirection("down");
        } else if (diff < -threshold) {
          setDirection("up");
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }

    const el = target?.current ?? window;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold, target]);

  return direction;
}
