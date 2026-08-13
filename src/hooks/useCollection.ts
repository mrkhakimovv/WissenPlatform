import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T>(path: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, path), ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      setData(result);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(`Error fetching collection ${path}:`, err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path, JSON.stringify(constraints.map(c => c.type))]); // Simplistic dependency array handling

  return { data, loading, error };
}
