'use client';
import { useState, useEffect, useCallback } from 'react';

export function useMutation<TInput, TOutput = any>(
  endpoint: string,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: TInput): Promise<TOutput | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }
      const result = await res.json();
      return result as TOutput;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  return { mutate, loading, error };
}

interface UseNotionDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  refetch: () => void;
}

export function useNotionData<T>(endpoint: string): UseNotionDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/${endpoint}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: { data: T; mock: boolean }) => {
        if (!cancelled) {
          setData(json.data);
          setIsMock(json.mock ?? false);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? '불러오기 실패');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, isMock, refetch };
}

interface UseSearchResult {
  results: unknown[];
  loading: boolean;
  error: string | null;
}

export function useSearch(query: string, debounceMs = 300): UseSearchResult {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: { results?: unknown[]; data?: unknown[] }) => {
        if (!cancelled) {
          setResults(json.results ?? json.data ?? []);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? '검색 실패');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return { results, loading, error };
}
