'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotionData } from '@/lib/hooks';
import type { Insight } from '@/lib/types';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

type FilterKey = '전체' | string;

const FILTERS: FilterKey[] = ['전체', 'AI', 'Policy', 'Design', 'Tips'];

export default function InsightsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('전체');
  const { data: insights, loading, error, refetch } = useNotionData<Insight[]>('insights');

  const filtered =
    activeFilter === '전체'
      ? (insights ?? [])
      : (insights ?? []).filter((c) => c.category === activeFilter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--n-canvas)' }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(247, 246, 243, 0.88)',
          backdropFilter: 'saturate(180%) blur(16px)',
          WebkitBackdropFilter: 'saturate(180%) blur(16px)',
          borderBottom: '1px solid var(--n-border)',
          padding: '18px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid var(--n-border)',
            background: 'var(--n-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--n-ink-60)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={14} />
        </button>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.4px',
            color: 'var(--n-ink)',
          }}
        >
          인사이트
        </span>
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '14px 20px 2px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {FILTERS.map((f) => {
          const isActive = f === activeFilter;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flexShrink: 0,
                padding: '5px 13px 6px',
                borderRadius: 9999,
                border: '1px solid var(--n-border)',
                background: isActive ? 'var(--n-ink)' : 'var(--n-surface)',
                color: isActive ? '#fff' : 'var(--n-ink-60)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '-0.1px',
                cursor: 'pointer',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Card list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '14px 20px',
        }}
      >
        {loading && (
          <div style={{ padding: '0' }}>
            <LoadingSkeleton variant="table" />
          </div>
        )}
        {error && !loading && (
          <ErrorState message={error} onRetry={refetch} />
        )}
        {!loading && !error && filtered.map((card, i) => (
          <div
            key={card.id}
            className={`n-card anim a${Math.min(i + 1, 7)}`}
            style={{ width: '100%' }}
          >
            {/* Cover */}
            <div
              className="n-card-cover"
              style={{
                background: card.coverColor,
                height: 80,
              }}
            >
              <span
                className="cover-tag"
                style={{ color: 'rgba(0,0,0,0.6)' }}
              >
                {card.category}
              </span>
            </div>

            {/* Title */}
            <div className="n-card-title">{card.title}</div>

            {/* Description */}
            <div className="n-card-desc">{card.description}</div>

            {/* Tags */}
            <div className="n-card-tags">
              {card.tags.map((tag, j) => (
                <span key={j} className="n-tag gray">
                  {tag}
                </span>
              ))}
              {card.date && (
                <span className="n-tag gray">{card.date}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
