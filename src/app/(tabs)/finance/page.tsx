'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Type,
  Tag,
  Building2,
} from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import type { FinanceEntry } from '@/lib/types';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

type Filter = '전체' | '수입' | '지출';

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) return `${man}만`;
    return `${man}만 ${remainder.toLocaleString()}`;
  }
  return `₩${amount.toLocaleString()}`;
}

function formatAmountFull(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

export default function FinancePage() {
  const [filter, setFilter] = useState<Filter>('전체');
  const { data, loading, error, isMock, refetch } = useNotionData<FinanceEntry[]>('finance');

  const entries = data ?? [];

  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetPct = totalIncome > 0
    ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100)
    : 0;

  const remaining = totalIncome - totalExpense;

  const filtered = entries.filter((e) => {
    if (filter === '전체') return true;
    if (filter === '수입') return e.type === 'income';
    return e.type === 'expense';
  });

  return (
    <>
      {/* ============ HEADER ============ */}
      <div className="hdr">
        <div className="hdr-topline">
          <div>
            <div className="hdr-hero">파이낸스</div>
            <div className="hdr-sub">4월 현황</div>
          </div>
        </div>
      </div>

      {/* ============ MOCK BANNER ============ */}
      {isMock && (
        <div
          style={{
            margin: '0 20px 8px',
            padding: '5px 10px',
            background: 'rgba(255, 171, 0, 0.1)',
            border: '1px solid rgba(255, 171, 0, 0.3)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            color: '#996600',
            letterSpacing: '-0.1px',
          }}
        >
          Mock 데이터
        </div>
      )}

      {/* ============ ERROR ============ */}
      {error && (
        <section className="w-section anim a1">
          <ErrorState message={error} onRetry={refetch} />
        </section>
      )}

      {/* ============ SUMMARY CARDS ============ */}
      {!error && (
        <section className="w-section anim a1">
          {loading ? (
            <LoadingSkeleton variant="metric" />
          ) : (
            <div
              className="metric-strip"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
            >
              {/* 총 수입 */}
              <div
                className="metric-card"
                style={{ '--accent': '#2a9d99' } as React.CSSProperties}
              >
                <div>
                  <div className="mc-icon teal">
                    <TrendingUp size={11} />
                  </div>
                  <div className="mc-label">총 수입</div>
                  <div className="mc-value teal">
                    {formatAmountFull(totalIncome)}
                  </div>
                </div>
              </div>

              {/* 총 지출 */}
              <div
                className="metric-card"
                style={{ '--accent': 'var(--n-red-tx)' } as React.CSSProperties}
              >
                <div>
                  <div className="mc-icon red">
                    <TrendingDown size={11} />
                  </div>
                  <div className="mc-label">총 지출</div>
                  <div className="mc-value red">
                    {formatAmountFull(totalExpense)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============ BUDGET PROGRESS ============ */}
      {!error && !loading && (
        <section className="w-section anim a2" style={{ padding: '0 20px' }}>
          {/* Label row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--n-ink)',
                letterSpacing: '-0.15px',
              }}
            >
              4월 예산
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--n-ink-60)',
              }}
            >
              {budgetPct}% 사용
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 6,
              borderRadius: 9999,
              background: 'rgba(55,53,47,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${budgetPct}%`,
                borderRadius: 9999,
                background: 'linear-gradient(90deg, #2a9d99, #4fc3bf)',
              }}
            />
          </div>

          {/* Below bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--n-ink-45)',
              }}
            >
              남은 {formatAmountFull(remaining)}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--n-ink-45)',
              }}
            >
              4월 30일
            </span>
          </div>
        </section>
      )}

      {/* ============ FILTER PILLS ============ */}
      <section className="w-section anim a3">
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '0 20px',
          }}
        >
          {(['전체', '수입', '지출'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 13px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '-0.1px',
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? 'var(--n-ink)' : 'rgba(55,53,47,0.06)',
                color: filter === f ? '#fff' : 'var(--n-ink-60)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ============ TRANSACTION LIST ============ */}
      <section className="w-section anim a4">
        {loading ? (
          <LoadingSkeleton variant="table" />
        ) : error ? null : (
          <div className="db-card">
            {/* Head */}
            <div className="db-head">
              <span className="h-icon" />
              <span className="h-name">
                <Type size={8} />
                클라이언트
              </span>
              <span className="h-prop" style={{ width: 66 }}>
                <Tag size={8} />
                유형
              </span>
              <span className="h-date" style={{ width: 70, textAlign: 'right' }}>
                금액
              </span>
            </div>

            {/* Rows */}
            {filtered.map((entry) => {
              const isIncome = entry.type === 'income';
              const label = isIncome ? '수입' : '지출';
              const amountDisplay = `${isIncome ? '+' : '-'}${formatAmount(entry.amount)}`;
              const row = (
                <div key={entry.id} className="db-row">
                  <div className="n-page-icon" style={{ color: 'var(--n-ink-45)', width: 10, flexShrink: 0 }}>
                    <Building2 size={10} />
                  </div>
                  <div className="db-title">{entry.client}</div>
                  <div className="db-prop" style={{ width: 66 }}>
                    <span className={`n-tag ${isIncome ? 'green' : 'red'}`}>
                      {label}
                    </span>
                  </div>
                  <div
                    className="db-date"
                    style={{
                      width: 70,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isIncome ? '#2a9d99' : 'var(--n-red-tx)',
                      textAlign: 'right',
                    }}
                  >
                    {amountDisplay}
                  </div>
                </div>
              );

              if (entry.notionUrl) {
                return (
                  <a
                    key={entry.id}
                    href={entry.notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}
                  >
                    {row}
                  </a>
                );
              }
              return row;
            })}

            {filtered.length === 0 && (
              <div
                style={{
                  padding: '24px 13px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'var(--n-ink-45)',
                }}
              >
                항목이 없습니다
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
