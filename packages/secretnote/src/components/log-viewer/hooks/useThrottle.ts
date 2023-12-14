import { throttle } from 'lodash';
import { useRef, useCallback, useEffect } from 'react';

type Callback = () => void;
const useThrottle = function useThrottle(cb: Callback, delay: number) {
  const cbRef = useRef(cb);
  useEffect(function () {
    cbRef.current = cb;
  });
  return useCallback(
    function () {
      return throttle(cbRef.current, delay)();
    },
    [delay],
  );
};

export default useThrottle;
