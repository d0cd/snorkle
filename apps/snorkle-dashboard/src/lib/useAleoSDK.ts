import { useEffect, useState } from 'react';

export function useAleoSDK() {
  const [sdk, setSdk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    import('@aleohq/sdk')
      .then((mod) => {
        if (isMounted) {
          setSdk(mod);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return [sdk, loading, error] as const;
} 