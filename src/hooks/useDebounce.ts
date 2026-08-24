import { useEffect, useState } from 'react';

/**
 * Returns `value`, but only updates after `delay` ms of no changes.
 * Useful for search inputs to avoid spamming the API.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}