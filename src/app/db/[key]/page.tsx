'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Palette,
  Briefcase,
  Wallet,
  Lightbulb,
  ChevronRight,
  Check,
  Sparkles,
  Code,
  Bookmark,
  Star,
  Hammer,
  Megaphone,
} from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import type { Task, FinanceEntry, Insight, Work } from '@/lib/types';

/* ── DB 설정 맵 ── */
const DB_CONFIG: Record<string, {
  title: string;
  subtitle?: string;
  icon: typeof Wallet;
  color: string;
  endpoint: string;
  hasSubFolders?: boolean;
}> = {
  tasks: {
    title: '태스크',
    subtitle: '일정 · 할 일',
    icon: Briefcase,
    color: '#615e57',
    endpoint: 'tasks',
  },
  finance: {
    title: '가계부',
    subtitle: '타임라인',
    icon: Wallet,
    color: '#9e422c',
    endpoint: 'finance',
  },
  insights: {
    title: '인사이트',
    subtitle: '지식 · 자료 저장소',
    icon: Lightbulb,
    color: '#006789',
    endpoint: 'insights',
    hasSubFolders: true,
  },
  works: {
    title: '웍스',
    subtitle: '노트 · 작업',
    icon: Palette,
    color: '#006789',
    endpoint: 'works',
  },
};

/* ── Insights sub-folder 설정 ── */
const INSIGHT_FOLDERS = [
  { key: 'ai', label: 'AI', dbId: '241003c7-f7be-800f-8f07-f95918c3a072', icon: Sparkles, color: '#9065b0' },
  { key: 'claude-code', label: 'Claude Code', dbId: '2fd003c7-f7be-80cb-90d3-dbecc15c507f', icon: Code, color: '#006789' },
  { key: 'scrap', label: 'Scrap', dbId: '247003c7-f7be-80c0-a9f4-cddbcd337415', icon: Bookmark, color: '#448361' },
  { key: 'design', label: 'Design', dbId: '241003c7-f7be-804f-a021-fc24777ca9ad', icon: Palette, color: '#006789' },
  { key: 'branding', label: 'Branding', dbId: '247003c7-f7be-803a-83f5-fd9494d24d62', icon: Star, color: '#d9730d' },
  { key: 'build', label: 'Build', dbId: '247003c7-f7be-8074-a583-e1638fd3cfed', icon: Hammer, color: '#615e57' },
  { key: 'marketing', label: 'Marketing', dbId: '247003c7-f7be-8035-83f4-d39480d66503', icon: Megaphone, color: '#c14c8a' },
];

/* ── 날짜 포맷 ── */
function fmtDate(d: string | null): string {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${dt.getMonth() + 1}.${dt.getDate()}`;
}

function fmtAmount(n: number): string {
  if (n >= 10000) return `${Math.round(n / 10000)}만원`;
  return `${n.toLocaleString()}원`;
}

/* ── 범용 DB 뷰 페이지 ── */
export default function DBViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = (params.key as string) || 'tasks';
  const config = DB_CONFIG[key] || DB_CONFIG.tasks;
  const Icon = config.icon;

  const subKey = searchParams.get('sub');
  const activeFolder = key === 'insights' && subKey
    ? INSIGHT_FOLDERS.find((f) => f.key === subKey)
    : null;

  /* insights sub-folder인 경우 dbId 파라미터로 해당 sub-DB 조회 */
  const endpointUrl = activeFolder
    ? `insights?dbId=${activeFolder.dbId}`
    : config.endpoint;

  const { data, loading } = useNotionData<any[]>(endpointUrl);
  const items = data ?? [];

  const showFolderGrid = key === 'insights' && !subKey;

  const [filter, setFilter] = useState('전체');

  /* ── 필터 옵션 (DB별 다름) ── */
  const filterOptions = useMemo(() => {
    if (key === 'finance') return ['전체', '수입', '지출'];
    if (key === 'tasks') return ['전체', '진행중', '완료'];
    if (key === 'works') return ['전체', '진행중', '완료', '대기'];
    if (key === 'insights') return ['전체'];
    return ['전체'];
  }, [key]);

  /* ── 필터 적용 ── */
  const filtered = useMemo(() => {
    if (filter === '전체') return items;

    if (key === 'finance') {
      if (filter === '수입') return items.filter((i: FinanceEntry) => i.type === 'income');
      if (filter === '지출') return items.filter((i: FinanceEntry) => i.type === 'expense');
    }
    if (key === 'tasks') {
      if (filter === '진행중') return items.filter((i: Task) => !i.done);
      if (filter === '완료') return items.filter((i: Task) => i.done);
    }
    if (key === 'works') {
      const statusMap: Record<string, string> = { '진행중': 'progress', '완료': 'done', '대기': 'todo' };
      return items.filter((i: Work) => i.status === statusMap[filter]);
    }
    return items;
  }, [items, filter, key]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div className="edit-header">
        <button
          onClick={() => {
            if (activeFolder) {
              router.push('/db/insights');
            } else {
              router.back();
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink)', fontSize: 15, fontWeight: 600,
          }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
          {activeFolder ? '인사이트' : 'Back'}
        </button>
      </div>

      {/* ── Title ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-md)',
            background: `${activeFolder ? activeFolder.color : config.color}15`,
            color: activeFolder ? activeFolder.color : config.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {activeFolder ? <activeFolder.icon style={{ width: 20, height: 20 }} /> : <Icon style={{ width: 20, height: 20 }} />}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
              {activeFolder ? activeFolder.label : config.title}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-variant)', marginTop: 2 }}>
              {showFolderGrid
                ? `${INSIGHT_FOLDERS.length}개 카테고리`
                : loading ? '불러오는 중...' : `${filtered.length}개 항목`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Insights folder grid ── */}
      {showFolderGrid && (
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
            {INSIGHT_FOLDERS.map((folder) => {
              const FolderIcon = folder.icon;
              return (
                <div
                  key={folder.key}
                  className="card"
                  onClick={() => router.push(`/db/insights?sub=${folder.key}`)}
                  style={{
                    padding: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'transform 0.15s',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = '')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                  onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = '')}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--r-md)',
                    background: `${folder.color}15`,
                    color: folder.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FolderIcon style={{ width: 24, height: 24 }} />
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '-0.2px',
                    color: 'var(--ink)',
                    textAlign: 'center',
                  }}>
                    {folder.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filter pills ── */}
      {!showFolderGrid && filterOptions.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '16px 20px 0', overflowX: 'auto' }} className="hide-scrollbar">
          {filterOptions.map(f => (
            <button key={f} className={`pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* ── List ── */}
      {!showFolderGrid && <div style={{ padding: '16px 20px 0' }}>
        {loading ? (
          <div className="card" style={{ padding: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(184,178,159,0.1)' }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--r-md)' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-outline)' }}>
            <p style={{ fontSize: 15, fontWeight: 600 }}>항목이 없습니다</p>
          </div>
        ) : (
          <div className="card">
            {filtered.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="list-row"
                onClick={() => item.id && router.push(`/edit/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* ── 아이콘/체크박스 영역 ── */}
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', flexShrink: 0, overflow: 'hidden' }}>
                  {key === 'tasks' ? (
                    <div style={{
                      width: '100%', height: '100%',
                      background: item.done ? 'var(--tertiary)' : 'var(--surface-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.done ? 'white' : 'var(--ink-outline)',
                    }}>
                      {item.done ? <Check style={{ width: 18, height: 18 }} /> : <Briefcase style={{ width: 16, height: 16 }} />}
                    </div>
                  ) : key === 'finance' ? (
                    <div style={{
                      width: '100%', height: '100%',
                      background: item.type === 'income' ? 'rgba(0,103,137,0.1)' : 'rgba(158,66,44,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.type === 'income' ? 'var(--tertiary)' : 'var(--error)',
                    }}>
                      <Wallet style={{ width: 16, height: 16 }} />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'var(--surface-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--ink-variant)',
                    }}>
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                  )}
                </div>

                {/* ── 본문 ── */}
                <div className="list-row-content">
                  <div className="list-row-title" style={{
                    textDecoration: key === 'tasks' && item.done ? 'line-through' : 'none',
                    color: key === 'tasks' && item.done ? 'var(--ink-outline)' : 'var(--ink)',
                  }}>
                    {item.title || item.client || '(제목 없음)'}
                  </div>
                  <div className="list-row-subtitle">
                    {key === 'finance' && (
                      <span style={{ color: item.type === 'income' ? 'var(--tertiary)' : 'var(--error)', fontWeight: 600 }}>
                        {item.type === 'income' ? '+' : '-'}{fmtAmount(item.amount)}
                      </span>
                    )}
                    {key === 'tasks' && item.category && (
                      <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>{item.category}</span>
                    )}
                    {key === 'works' && item.status && (
                      <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>
                        {item.status === 'done' ? '완료' : item.status === 'progress' ? '진행중' : '대기'}
                      </span>
                    )}
                    {key === 'insights' && item.category && (
                      <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>{item.category}</span>
                    )}
                    {(item.dueDate || item.date) && (
                      <span style={{ marginLeft: 6, color: 'var(--ink-outline)', fontSize: 11 }}>
                        {fmtDate(item.dueDate || item.date)}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight style={{ width: 16, height: 16, color: 'var(--ink-outline-variant)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}
