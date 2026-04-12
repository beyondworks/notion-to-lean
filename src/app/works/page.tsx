'use client';

import { useState } from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Status = 'done' | 'progress' | 'todo';
type FilterKey = '전체' | '진행중' | '완료' | '대기';

interface WorkCard {
  id: number;
  title: string;
  category: string;
  coverGradient: string;
  coverTagColor: string;
  desc: string;
  status: Status;
  statusLabel: string;
}

const CARDS: WorkCard[] = [
  {
    id: 1,
    title: '세븐플러스 K-art 기획안',
    category: '기획',
    coverGradient: 'linear-gradient(135deg, #e7f3f8 0%, #b8d9ec 100%)',
    coverTagColor: 'var(--n-blue-tx)',
    desc: '기획 방향 1차 검토 완료',
    status: 'done',
    statusLabel: '완료',
  },
  {
    id: 2,
    title: 'Magiclight 영상 대본',
    category: 'Video',
    coverGradient: 'linear-gradient(135deg, #fbecdd 0%, #f5c897 100%)',
    coverTagColor: 'var(--n-orange-tx)',
    desc: '초안 전달 완료',
    status: 'progress',
    statusLabel: '진행중',
  },
  {
    id: 3,
    title: '해커스 바이브코딩',
    category: '강의',
    coverGradient: 'linear-gradient(135deg, #edf3ec 0%, #b2d9b5 100%)',
    coverTagColor: 'var(--n-green-tx)',
    desc: '2차시 수정본 작업 중',
    status: 'progress',
    statusLabel: '진행중',
  },
  {
    id: 4,
    title: 'Notion-to-Lean 허브',
    category: '개발',
    coverGradient: 'linear-gradient(135deg, #f4f0f7 0%, #d5c0e8 100%)',
    coverTagColor: 'var(--n-purple-tx)',
    desc: '프로토타입 구축 중',
    status: 'progress',
    statusLabel: '진행중',
  },
  {
    id: 5,
    title: '브랜드 가이드라인',
    category: '디자인',
    coverGradient: 'linear-gradient(135deg, #f9eef3 0%, #edb3d0 100%)',
    coverTagColor: 'var(--n-pink-tx)',
    desc: '초안 작성 대기',
    status: 'todo',
    statusLabel: '대기',
  },
  {
    id: 6,
    title: '투자 IR 자료',
    category: '비즈니스',
    coverGradient: 'linear-gradient(135deg, #f4eeee 0%, #ddb89e 100%)',
    coverTagColor: 'var(--n-brown-tx)',
    desc: '2차 라운드 준비',
    status: 'todo',
    statusLabel: '대기',
  },
];

const FILTER_STATUS_MAP: Record<FilterKey, Status | null> = {
  전체: null,
  진행중: 'progress',
  완료: 'done',
  대기: 'todo',
};

const FILTERS: FilterKey[] = ['전체', '진행중', '완료', '대기'];

export default function WorksPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('전체');

  const filtered =
    FILTER_STATUS_MAP[activeFilter] === null
      ? CARDS
      : CARDS.filter((c) => c.status === FILTER_STATUS_MAP[activeFilter]);

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
                height: 64,
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
              {card.desc}
            </div>

            {/* Status */}
            <div className="n-card-tags">
              <span className={`n-status ${card.status}`}>
                {card.statusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
