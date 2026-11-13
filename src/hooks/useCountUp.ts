import {useEffect, useRef, useState} from 'react';

/**
 * Counts a number up (or down) to its new target.
 * Plain JS stepping: the value drives a <Text>, so there is nothing to
 * hand to the native driver here.
 */
export function useCountUp(target: number, duration: number): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      return;
    }
    const startedAt = Date.now();
    const span = Math.max(160, duration);

    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - startedAt) / span);
      setValue(Math.round(from + (target - from) * t));
      if (t >= 1) {
        fromRef.current = target;
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 40);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}
