'use client';

import { useState } from 'react';
import { Search, Clock, X, FileText, Sparkles, Briefcase, BarChart3 } from 'lucide-react';

const RECENT_SEARCHES = [
  'Stitch 디자인 시스템',
  'Notion API 연동',
  '주간 리포트',
  '프로젝트 회고',
];

const SUGGESTIONS = [
  { icon: Sparkles, title: 'Weekly Focus Report', category: 'AI', catBg: 'rgba(0,103,137,0.1)', catColor: 'var(--tertiary)' },
  { icon: Briefcase, title: '세븐플러스 K-art 기획안', category: 'Work', catBg: 'rgba(97,94,87,0.1)', catColor: 'var(--primary)' },
  { icon: BarChart3, title: '4월 예산 현황', category: 'Finance', catBg: 'rgba(158,66,44,0.1)', catColor: 'var(--error)' },
  { icon: FileText, title: 'API 아키텍처 메모', category: 'Memo', catBg: 'rgba(97,94,87,0.08)', catColor: 'var(--ink-variant)' },
  { icon: Sparkles, title: 'Productivity Insights', category: 'AI', catBg: 'rgba(0,103,137,0.1)', catColor: 'var(--tertiary)' },
  { icon: Briefcase, title: '디자인 리서치 노트', category: 'Design', catBg: 'rgba(0,103,137,0.08)', catColor: 'var(--tertiary)' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

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

      {/* Recent searches */}
      <section style={{ marginTop: 28 }} className="anim-in">
        <div className="section-label">Recent Searches</div>
        <div className="card" style={{ margin: '0 20px' }}>
          {RECENT_SEARCHES.map((item, idx) => (
            <div
              key={idx}
              className="list-row"
              style={{ cursor: 'pointer', padding: '10px 16px' }}
              onClick={() => setQuery(item)}
            >
              <Clock style={{ width: 16, height: 16, color: 'var(--ink-outline)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.2px' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested */}
      <section style={{ marginTop: 28 }} className="anim-in anim-in-d2">
        <div className="section-label">Suggested</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
          {SUGGESTIONS.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: 14, cursor: 'pointer' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-sm)',
                background: item.catBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <item.icon style={{ width: 16, height: 16, color: item.catColor }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: 8 }}>
                {item.title}
              </div>
              <span className="pill" style={{ fontSize: 10 }}>{item.category}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
