import { useState, useEffect } from 'react';
import * as aleo from '@provablehq/sdk';

export function useAleoSDK() {
  const [sdk, setSDK] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSDK = async () => {
      try {
        await aleo.initThreadPool();
        setSDK(aleo);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load Aleo SDK'));
        setLoading(false);
      }
    };

    loadSDK();
  }, []);

  return { sdk, error, loading };
} 