import confetti from 'canvas-confetti';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

function useUntrackedValue<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function useConfettiPreference() {
  const getCurrentValue = useCallback(() => {
    return localStorage.getItem('confettiDisabled') === 'true';
  }, []);

  const disabled = useSyncExternalStore((callback) => {
    const listener = ({ key }: StorageEvent) => {
      if (key === 'org.secretflow.promos.202306.confettiDisabled') {
        callback();
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, getCurrentValue);

  const toggle = useCallback(() => {
    localStorage.setItem('confettiDisabled', String(!getCurrentValue()));
  }, [getCurrentValue]);

  return { disabled, toggle };
}

type Frame = Pick<
  confetti.Options,
  | 'angle'
  | 'particleCount'
  | 'spread'
  | 'decay'
  | 'startVelocity'
  | 'gravity'
  | 'scalar'
>;

export type ConfettiFrames = Frame[];

// https://www.kirilv.com/canvas-confetti/#realistic
const DEFAULT_FRAMES: ConfettiFrames = [
  {
    angle: 270,
    particleCount: 200 * 0.25,
    spread: 26,
    startVelocity: 55,
  },
  {
    angle: 270,
    particleCount: 200 * 0.2,
    spread: 60,
  },
  {
    angle: 270,
    particleCount: 200 * 0.35,
    decay: 0.91,
    spread: 100,
    scalar: 0.8,
  },
  {
    angle: 270,
    particleCount: 200 * 0.1,
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  },
  {
    angle: 270,
    particleCount: 200 * 0.1,
    spread: 120,
    startVelocity: 45,
  },
];

export function useConfetti(
  {
    predicate,
    elementRef,
    ...confettiOptions
  }: {
    /**
     * Confetti effects are triggered the first time predicate returns a different non-empty string
     *
     * The function should return a Promise. You can use this to defer the animation.
     */
    predicate: () => Promise<string | undefined>;
    /**
     * If provided and bound to a DOM element, effects will be centered around the element
     */
    elementRef?: React.RefObject<HTMLElement | null>;
    /**
     * Options for the confetti animation
     */
    frames?: ConfettiFrames;
  } & Pick<confetti.Options, 'zIndex' | 'spread'> = {
    predicate: async () => undefined,
  },
) {
  const animOptions = useUntrackedValue(confettiOptions);

  const { disabled } = useConfettiPreference();

  const getOrigin = useCallback((): { x: number; y: number } => {
    if (elementRef && elementRef.current) {
      const { left, top, width, height } = elementRef.current.getBoundingClientRect();
      return {
        x: (left + width / 2) / window.innerWidth,
        y: (top + height / 2) / window.innerHeight,
      };
    }
    return { x: 0.5, y: 0.5 };
  }, [elementRef]);

  const [previousHit, setPreviousHit] = useState<string | undefined>(undefined);

  const future = useRef<Promise<string | undefined>>();

  useEffect(() => {
    if (disabled) {
      return;
    }

    const currentFuture = predicate();
    future.current = currentFuture;

    currentFuture
      .then((hit) => {
        // another frame occurred, cancel the currently planned animation
        if (future.current !== currentFuture) {
          return undefined;
        }

        setPreviousHit(hit);

        if (hit && previousHit !== hit) {
          const frames = animOptions.current?.frames || DEFAULT_FRAMES;
          requestAnimationFrame(() => {
            frames.forEach((frame) => {
              confetti({
                ...frame,
                zIndex: animOptions.current.zIndex,
                origin: getOrigin(),
                spread: animOptions.current.spread,
              });
            });
          });
        }

        return undefined;
      })
      .catch(console.error);
  }, [animOptions, disabled, getOrigin, predicate, previousHit]);
}
