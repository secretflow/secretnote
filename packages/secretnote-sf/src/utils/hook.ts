import { useRef } from 'react';

/**
 * Execute a function right now but only once inside a React component.
 */
export function useRunOnce(fn: () => any) {
  const done = useRef(false);
  if (!done.current) {
    fn();
    done.current = true;
  }
}
