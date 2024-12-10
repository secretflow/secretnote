import { useCallback, useEffect, useRef } from 'react';

type Callback = (val: string) => void;

function useDebounceInput(cb: Callback, delay: number) {
  const cbRef = useRef(cb);
  const timerRef = useRef<number>(0);
  useEffect(function () {
    cbRef.current = cb;
  });
  useEffect(function () {
    return function () {
      clearTimeout(timerRef.current);
    };
  }, []);
  return useCallback(
    function (e: React.ChangeEvent<HTMLInputElement>) {
      const value = e.target.value;
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(function () {
        cbRef.current(value);
      }, delay);
    },
    [delay],
  );
}

export default useDebounceInput;
