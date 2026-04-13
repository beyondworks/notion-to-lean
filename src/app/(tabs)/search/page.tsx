'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Clock3,
  X,
  FileText,
  Sparkles,
  Briefcase,
  CheckCircle2,
  BookOpen,
  Video,
  BarChart2,
  Banknote,
} from 'lucide-react';
import SectionHead from '@/components/SectionHead';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useSearch } from '@/lib/hooks';
import type { SearchResult } from '@/lib/types';

// ============ 상수 ============
const RECENT_KEY = 'notion-lean-recent-searches';
const MAX_RECENT = 10;

// ============ 아이콘 매핑 ============
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  'CheckCircle2': CheckCircle2,
  'check-circle-2': CheckCircle2,
  'Briefcase': Briefcase,
  'briefcase': Briefcase,
  'Sparkles': Sparkles,
  'sparkles': Sparkles,
  'Banknote': Banknote,
  'banknote': Banknote,
};

// ============ 타입 뱃지 레이블 ============
const TYPE_LABEL: Record<SearchResult['type'], string> = {
  task: '태스크',
  insight: 'AI',
  work: '기획',
  finance: '파이낸스',
};

const TYPE_CLASS: Record<SearchResult['type'], string> = {
  task: 'n-tag red',
  insight: 'n-tag purple',
  work: 'n-tag blue',
  finance: 'n-tag green',
};

// ============ localStorage 유틸 ============
function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function addToRecent(query: string, current: string[]): string[] {
  const trimmed = query.trim();
  if (!trimmed) return current;
  const deduped = [trimmed, ...current.filter((r) => r !== trimmed)];
  return deduped.slice(0, MAX_RECENT);
}

// ============ 추천 페이지 데이터 (기존 유지) ============
interface RecommendCard {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  category: string;
  categoryClass: string;
}

const RECOMMEND_CARDS: RecommendCard[] = [
  {
    icon: <Sparkles size={12} />,
    iconColor: 'var(--n-purple-tx)',
    title: 'Google Gemma 4 출시 분석',
    category: 'AI',
    categoryClass: 'n-tag purple',
  },
  {
    icon: <Video size={12} />,
    iconColor: 'var(--n-orange-tx)',
    title: 'Magiclight 영상 대본',
    category: 'Video',
    categoryClass: 'n-tag orange',
  },
  {
    icon: <BookOpen size={12} />,
    iconColor: 'var(--n-green-tx)',
    title: '해커스 바이브코딩 커리큘럼',
    category: '강의',
    categoryClass: 'n-tag green',
  },
  {
    icon: <Briefcase size={12} />,
    iconColor: 'var(--n-blue-tx)',
    title: '세븐플러스 K-art 기획안',
    category: '기획',
    categoryClass: 'n-tag blue',
  },
  {
    icon: <BarChart2 size={12} />,
    iconColor: '#2a9d99',
    title: '예산 현황 대시보드',
    category: '파이낸스',
    categoryClass: 'n-tag green',
  },
  {
    icon: <CheckCircle2 size={12} />,
    iconColor: 'var(--n-red-tx)',
    title: '4월 태스크 목록',
    category: '태스크',
    categoryClass: 'n-tag red',
  },
];

// ============ 메인 컴포넌트 ============
export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  // mount 시 localStorage에서 최근 검색어 로드
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const { results: rawResults, loading, error } = useSearch(query, 300);
  const results = rawResults as SearchResult[];

  // 최근 검색어 저장 (엔터 키)
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      const updated = addToRecent(query, recent);
      setRecent(updated);
      saveRecent(updated);
    }
  }

  // 결과 클릭: 최근 검색어 저장 + 네비게이션
  function handleResultClick(result: SearchResult) {
    const updated = addToRecent(query, recent);
    setRecent(updated);
    saveRecent(updated);
    router.push(result.url);
  }

  function removeRecent(item: string) {
    const updated = recent.filter((r) => r !== item);
    setRecent(updated);
    saveRecent(updated);
  }

  function clearAllRecent() {
    setRecent([]);
    saveRecent([]);
  }

  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* ============ SEARCH INPUT ============ */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(247, 246, 243, 0.82)',
          backdropFilter: 'saturate(180%) blur(16px)',
          WebkitBackdropFilter: 'saturate(180%) blur(16px)',
          padding: 'calc(18px + var(--safe-t)) 20px 14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--n-surface)',
            border: '1px solid var(--n-border)',
            borderRadius: 10,
            padding: '9px 13px',
          }}
        >
          <Search size={14} style={{ color: 'var(--n-ink-45)', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="페이지 검색..."
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--n-ink)',
              letterSpacing: '-0.15px',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--n-hover-2)',
                color: 'var(--n-ink-45)',
                flexShrink: 0,
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* ============ 검색 결과 상태 ============ */}
      {hasQuery ? (
        <>
          {loading && (
            <div style={{ margin: '0 20px' }}>
              <LoadingSkeleton variant="list" />
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '0 20px' }}>
              <EmptyState
                icon={<Search size={28} />}
                message="검색 중 오류가 발생했습니다"
                sub={error}
              />
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={<Search size={28} />}
              message="검색 결과가 없습니다"
              sub={`"${query}"에 해당하는 페이지를 찾을 수 없어요`}
            />
          )}

          {!loading && !error && results.length > 0 && (
            <section className="w-section anim a1">
              <div
                style={{
                  margin: '0 20px',
                  background: 'var(--n-surface)',
                  border: '1px solid var(--n-border)',
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                }}
              >
                {results.map((result, idx) => {
                  const IconComp = ICON_MAP[result.icon] ?? FileText;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 13px',
                        width: '100%',
                        textAlign: 'left',
                        borderBottom: idx < results.length - 1 ? '1px solid var(--n-border)' : 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-hover)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: 'var(--n-canvas)',
                          color: 'var(--n-ink-45)',
                          flexShrink: 0,
                        }}
                      >
                        <IconComp size={12} />
                      </div>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--n-ink)',
                          letterSpacing: '-0.15px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {result.title}
                      </span>
                      <span className={TYPE_CLASS[result.type]}>
                        {TYPE_LABEL[result.type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          {/* ============ 최근 검색어 ============ */}
          {recent.length > 0 && (
            <section className="w-section anim a1">
              <SectionHead
                icon={<Clock3 size={10} style={{ color: 'var(--n-ink-45)' }} />}
                iconColor="var(--n-ink-45)"
                title="최근 검색어"
                moreLabel="전체 삭제"
                onMore={clearAllRecent}
              />
              <div
                style={{
                  margin: '0 20px',
                  background: 'var(--n-surface)',
                  border: '1px solid var(--n-border)',
                  borderRadius: 'var(--r-card)',
                  overflow: 'hidden',
                }}
              >
                {recent.map((item, idx) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 13px',
                      borderBottom: idx < recent.length - 1 ? '1px solid var(--n-border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    <Clock3 size={13} style={{ color: 'var(--n-ink-45)', flexShrink: 0 }} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--n-ink)',
                        letterSpacing: '-0.15px',
                      }}
                    >
                      {item}
                    </span>
                    <button
                      onClick={() => removeRecent(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: 'var(--r-row)',
                        color: 'var(--n-ink-45)',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-hover-2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ============ 추천 페이지 ============ */}
          <section className="w-section anim a2">
            <SectionHead
              icon={<FileText size={10} style={{ color: 'var(--n-blue-tx)' }} />}
              iconColor="var(--n-blue-tx)"
              title="추천 페이지"
              moreLabel="더보기"
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                padding: '0 20px',
              }}
            >
              {RECOMMEND_CARDS.map((card) => (
                <button
                  key={card.title}
                  style={{
                    background: 'var(--n-surface)',
                    border: '1px solid var(--n-border)',
                    borderRadius: 'var(--r-card)',
                    padding: '11px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    textAlign: 'left',
                    transition: 'background 0.12s, border-color 0.12s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-border-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-border)';
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-hover)';
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-surface)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: 'var(--n-canvas)',
                      color: card.iconColor,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--n-ink)',
                      letterSpacing: '-0.15px',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {card.title}
                  </div>
                  <span className={card.categoryClass}>{card.category}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
