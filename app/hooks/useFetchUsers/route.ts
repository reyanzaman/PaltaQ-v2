import { useState, useEffect, useCallback } from 'react';

export default function useFetchUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}