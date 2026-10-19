import { useCallback, useSyncExternalStore } from 'react';

/** Theo dõi một media query; render lần đầu đã đúng giá trị (không nhấp nháy). */
export function useMediaQuery(query: string): boolean {
  const dangKy = useCallback(
    (nghe: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', nghe);
      return () => mql.removeEventListener('change', nghe);
    },
    [query],
  );
  return useSyncExternalStore(
    dangKy,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
