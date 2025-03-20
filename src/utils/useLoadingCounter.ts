import { useCallback, useRef } from 'react';

const useLoadingCounter = () => {
  const loadingCounter = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((isLoading: boolean) => {
    loadingCounter.current += isLoading ? 1 : -1;
    setIsLoading(loadingCounter.current > 0);
  }, []);

  return { isLoading, setLoading };
};

export default useLoadingCounter;
