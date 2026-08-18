import { useEffect, useRef } from 'react';

interface UseInfiniteScrollTriggerOptions {
  onIntersect: () => void;
  enabled: boolean;
  rootMargin?: string;
}

export function useInfiniteScrollTrigger({ onIntersect, enabled, rootMargin = '400px' }: UseInfiniteScrollTriggerOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onIntersect, rootMargin]);

  return sentinelRef;
}
