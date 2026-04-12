'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Category = '전체' | 'AI' | 'Policy' | 'Design' | 'Tips';

interface InsightCard {
  id: number;
  title: string;
  desc: string;
  category: Category;
  coverGradient: string;
  coverTagColor: string;
  tags: { label: string; className: string }[];
}

const INSIGHTS: InsightCard[] = [
  {
    id: 1,
    title: 'Google Gemma 4 출시 분석',
    desc: 'Apache 2.0 라이선스, MoE 26B 아키텍처로 오픈소스 진영에서 가장 강력한 추론 모델로 등장했다.',
    category: 'AI',
    coverGradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    coverTagColor: '#6d28d9',
    tags: [
      { label: 'AI', className: 'n-tag purple' },
      { label: 'Google', className: 'n-tag gray' },
    ],
  },
  {
    id: 2,
    title: 'Anthropic 4/4 정책 변경',
    desc: 'Claude Pro/Max 구독 third-party 앱 사용 제한 및 API 정책 업데이트가 개발자에게 미치는 영향 분석.',
    category: 'Policy',
    coverGradient: 'linear-gradient(135deg, #fca5a5 0%, #dc2626 100%)',
    coverTagColor: '#b91c1c',
    tags: [
      { label: 'Policy', className: 'n-tag red' },
      { label: 'Anthropic', className: 'n-tag gray' },
    ],
  },
  {
    id: 3,
    title: 'awesome-design-md 35K stars',
    desc: '10일 만에 GitHub 역대 최속 스타 증가 기록. 디자인 시스템 문서화 방법론을 마크다운으로 정리한 레포.',
    category: 'Design',
    coverGradient: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
    coverTagColor: '#1d4ed8',
    tags: [
      { label: 'Design', className: 'n-tag blue' },
      { label: 'GitHub', className: 'n-tag gray' },
    ],
  },
  {
    id: 4,
    title: 'Claude Code 에이전트 패턴',
    desc: '서브에이전트 오케스트레이션, 병렬 실행, 결과 집계까지 — 실전 멀티에이전트 구현 패턴 정리.',
    category: 'AI',
    coverGradient: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)',
    coverTagColor: '#6d28d9',
    tags: [
      { label: 'AI', className: 'n-tag purple' },
      { label: 'Claude', className: 'n-tag gray' },
    ],
  },
  {
    id: 5,
    title: 'Figma AI 자동 디자인 발표',
    desc: '디자인 작업의 80%를 자동화하겠다는 발표. 컴포넌트 생성, 레이아웃 제안, 배색까지 AI가 처리한다.',
    category: 'Design',
    coverGradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
    coverTagColor: '#1d4ed8',
    tags: [
      { label: 'Design', className: 'n-tag blue' },
      { label: 'Figma', className: 'n-tag gray' },
    ],
  },
  {
    id: 6,
    title: 'Notion DB 뷰 자동화 팁',
    desc: '3가지 뷰 설정으로 주간 리뷰를 10분으로 단축하는 Notion 데이터베이스 자동화 실전 세팅 가이드.',
    category: 'Tips',
    coverGradient: 'linear-gradient(135deg, #fdba74 0%, #ea580c 100%)',
    coverTagColor: '#c2410c',
    tags: [
      { label: 'Tips', className: 'n-tag orange' },
      { label: 'Notion', className: 'n-tag gray' },
    ],
  },
];

const FILTERS: Category[] = ['전체', 'AI', 'Policy', 'Design', 'Tips'];

export default function InsightsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Category>('전체');

  const filtered =
    activeFilter === '전체'
      ? INSIGHTS
      : INSIGHTS.filter((c) => c.category === activeFilter);

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
        {filtered.map((card, i) => (
          <div
            key={card.id}
            className={`n-card anim a${Math.min(i + 1, 7)}`}
            style={{ width: '100%' }}
          >
            {/* Cover */}
            <div
              className="n-card-cover"
              style={{
                background: card.coverGradient,
                height: 80,
              }}
            >
              <span
                className="cover-tag"
                style={{ color: card.coverTagColor }}
              >
                {card.category}
              </span>
            </div>

            {/* Title */}
            <div className="n-card-title">{card.title}</div>

            {/* Description */}
            <div className="n-card-desc">{card.desc}</div>

            {/* Tags */}
            <div className="n-card-tags">
              {card.tags.map((t, j) => (
                <span key={j} className={t.className}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
