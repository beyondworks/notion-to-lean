'use client';

import { useState } from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotionData } from '@/lib/hooks';
import type { Work } from '@/lib/types';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

type Status = 'done' | 'progress' | 'todo';
type FilterKey = '전체' | '진행중' | '완료' | '대기';

const FILTER_STATUS_MAP: Record<FilterKey, Status | null> = {
  전체: null,
  진행중: 'progress',
  완료: 'done',
  대기: 'todo',
};

const STATUS_LABEL: Record<Status, string> = {
  done: '완료',
  progress: '진행중',
  todo: '대기',
};

const FILTERS: FilterKey[] = ['전체', '진행중', '완료', '대기'];

export default function WorksPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('전체');
  const { data: works, loading, error, refetch } = useNotionData<Work[]>('works');

  const filtered =
    FILTER_STATUS_MAP[activeFilter] === null
      ? (works ?? [])
      : (works ?? []).filter((c) => c.status === FILTER_STATUS_MAP[activeFilter]);

  return (
    <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <div className="hdr">
        <div className="hdr-topline">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <span className="hdr-hero" style={{ fontSize: 22 }}>
              웍스
            </span>
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--n-ink-60)',
            }}
          >
            <Briefcase size={16} />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '14px 20px 0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flexShrink: 0,
                padding: '5px 12px 6px',
                borderRadius: 9999,
                border: '1px solid',
                borderColor: isActive ? 'transparent' : 'var(--n-border)',
                background: isActive ? 'var(--n-ink)' : 'var(--n-surface)',
                color: isActive ? '#ffffff' : 'var(--n-ink-60)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '-0.1px',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* 2-column card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          padding: '14px 20px 0',
        }}
      >
        {loading && (
          <div style={{ gridColumn: '1 / -1' }}>
            <LoadingSkeleton variant="table" />
          </div>
        )}
        {error && !loading && (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorState message={error} onRetry={refetch} />
          </div>
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
                height: 64,
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

            {/* Desc — 1 line clamp */}
            <div
              className="n-card-desc"
              style={{
                WebkitLineClamp: 1,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {card.description}
            </div>

            {/* Status */}
            <div className="n-card-tags">
              <span className={`n-status ${card.status}`}>
                {STATUS_LABEL[card.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
