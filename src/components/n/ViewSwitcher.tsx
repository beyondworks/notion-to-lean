'use client';

import type { LucideIcon } from 'lucide-react';
import { List, LayoutGrid, Calendar, Database } from 'lucide-react';

export type DbView = 'list' | 'board' | 'cal' | 'table';

const VIEWS: Array<{ k: DbView; Icon: LucideIcon; label: string }> = [
  { k: 'list', Icon: List, label: '리스트' },
  { k: 'board', Icon: LayoutGrid, label: '보드' },
  { k: 'cal', Icon: Calendar, label: '캘린더' },
  { k: 'table', Icon: Database, label: '테이블' },
];

interface ViewSwitcherProps {
  view: DbView;
  onChange: (v: DbView) => void;
  available?: DbView[];
}

export function ViewSwitcher({ view, onChange, available }: ViewSwitcherProps) {
  const list = available ? VIEWS.filter((v) => available.includes(v.k)) : VIEWS;
  return (
    <div
      style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '6px 16px 10px' }}
      className="hide-scroll"
    >
      {list.map((v) => {
        const on = view === v.k;
        return (
          <button
            key={v.k}
            type="button"
            onClick={() => onChange(v.k)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 16,
              border: 'none',
              background: on ? 'var(--n-accent)' : 'var(--n-surface)',
              color: on ? 'var(--n-bg)' : 'var(--n-text)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: on ? 'none' : 'var(--sh-1)',
            }}
          >
            <v.Icon size={15} strokeWidth={1.8} />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
