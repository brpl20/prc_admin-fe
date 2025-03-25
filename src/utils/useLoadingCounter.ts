import { useCallback, useRef, useState } from 'react';

const useLoadingCounter = (setExternalLoading?: (loading: boolean) => void) => {
  const loadingCounter = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback(
    (isLoading: boolean) => {
      loadingCounter.current += isLoading ? 1 : -1;
      const newLoadingState = loadingCounter.current > 0;

      setIsLoading(newLoadingState);

      if (setExternalLoading) {
        setExternalLoading(newLoadingState);
      }
    },
    [setExternalLoading],
  );

  return { isLoading, setLoading };
};

export default useLoadingCounter;
