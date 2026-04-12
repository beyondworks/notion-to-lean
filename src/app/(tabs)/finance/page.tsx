'use client';

import { useState } from 'react';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Type,
  Tag,
  Building2,
} from 'lucide-react';

type Filter = '전체' | '수입' | '지출';

const transactions = [
  { key: 'f1', client: '아카데미', type: '수입' as const, amount: '+200만' },
  { key: 'f2', client: 'KCC정보통신', type: '수입' as const, amount: '+150만' },
  { key: 'f3', client: '젠스파크', type: '수입' as const, amount: '+110만' },
  { key: 'f4', client: '매직라이트', type: '수입' as const, amount: '+70만' },
  { key: 'f5', client: '사무실 월세', type: '지출' as const, amount: '-120만' },
  { key: 'f6', client: '소프트웨어 구독', type: '지출' as const, amount: '-44만' },
];

export default function FinancePage() {
  const [filter, setFilter] = useState<Filter>('전체');

  const filtered = transactions.filter((t) =>
    filter === '전체' ? true : t.type === filter
  );

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

      {/* ============ SUMMARY CARDS ============ */}
      <section className="w-section anim a1">
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
                ₩3,800,000
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
                ₩2,560,000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BUDGET PROGRESS ============ */}
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
            68% 사용 · 19일 남음
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
              width: '68%',
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
            남은 ₩1,240,000
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
          {filtered.map((t) => (
            <div key={t.key} className="db-row">
              <div className="n-page-icon" style={{ color: 'var(--n-ink-45)', width: 10, flexShrink: 0 }}>
                <Building2 size={10} />
              </div>
              <div className="db-title">{t.client}</div>
              <div className="db-prop" style={{ width: 66 }}>
                <span className={`n-tag ${t.type === '수입' ? 'green' : 'red'}`}>
                  {t.type}
                </span>
              </div>
              <div
                className="db-date"
                style={{
                  width: 70,
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.type === '수입' ? '#2a9d99' : 'var(--n-red-tx)',
                  textAlign: 'right',
                }}
              >
                {t.amount}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
