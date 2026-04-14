'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Clock, X, FileText, Sparkles, Briefcase, CheckCircle2, Banknote, Loader2 } from 'lucide-react';
import { useSearch } from '@/lib/hooks';
import type { SearchResult } from '@/lib/types';

const STORAGE_KEY = 'ntl-recent-searches';
const MAX_RECENT = 10;

const ICON_MAP: Record<string, typeof FileText> = {
  CheckCircle2,
  Banknote,
  Sparkles,
  Briefcase,
  FileText,
};

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getRecentSearches().filter((s) => s !== query);
    list.unshift(query);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { results, loading } = useSearch(query, 300);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Sync query from URL params (e.g., /search?q=Design)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) setQuery(q);
  }, [searchParams]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    router.push(`/edit/${result.id}`);
  }, [query, router]);

  const handleRecentClick = useCallback((item: string) => {
    setQuery(item);
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const typedResults = results as SearchResult[];
  const showResults = query.trim().length > 0;

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">Search</span>
        </div>
      </header>

      {/* Search input */}
      <div style={{ padding: 'calc(80px + var(--safe-t)) 20px 0' }}>
        <div className="search-input-wrap">
          <Search />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tasks, memos..."
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--surface-container)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--ink-variant)',
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {showResults && (
        <section style={{ marginTop: 20 }} className="anim-in">
          <div className="section-label">
            {loading ? 'Searching...' : `${typedResults.length} result${typedResults.length !== 1 ? 's' : ''}`}
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 style={{ width: 24, height: 24, color: 'var(--ink-outline)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : typedResults.length > 0 ? (
            <div className="card" style={{ margin: '0 20px' }}>
              {typedResults.map((result) => {
                const IconComp = ICON_MAP[result.icon] || FileText;
                return (
                  <div
                    key={result.id}
                    className="list-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleResultClick(result)}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-container)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <IconComp style={{ width: 16, height: 16, color: 'var(--ink-variant)' }} />
                    </div>
                    <div className="list-row-content">
                      <div className="list-row-title">{result.title}</div>
                      <div className="list-row-subtitle">{result.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-variant)', fontSize: 14 }}>
              No results found
            </div>
          )}
        </section>
      )}

      {/* Recent searches (shown when no query) */}
      {!showResults && recentSearches.length > 0 && (
        <section style={{ marginTop: 28 }} className="anim-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-variant)' }}>Recent Searches</span>
            <button
              onClick={handleClearRecent}
              style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 600, color: 'var(--tertiary)', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
          <div className="card" style={{ margin: '0 20px' }}>
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="list-row"
                style={{ cursor: 'pointer', padding: '10px 16px' }}
                onClick={() => handleRecentClick(item)}
              >
                <Clock style={{ width: 16, height: 16, color: 'var(--ink-outline)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.2px' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no query and no recent */}
      {!showResults && recentSearches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-variant)' }} className="anim-in">
          <Search style={{ width: 40, height: 40, color: 'var(--ink-outline-variant)', marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Search your workspace</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Find tasks, memos, projects, and more</div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
