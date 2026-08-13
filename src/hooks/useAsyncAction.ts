import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async <T>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
    setLoading(true);
    try {
      const result = await action();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err: any) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, execute };
}
