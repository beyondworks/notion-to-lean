'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Filter, MoreHorizontal, Plus, Clock, Check } from 'lucide-react';
import { useNotionData, useMutation } from '@/lib/hooks';
import type { Task, FinanceEntry, Insight, Work } from '@/lib/types';
import { NavBar, NavIconBtn, BackBtn } from '@/components/n/NavBar';
import { ViewSwitcher, type DbView } from '@/components/n/ViewSwitcher';
import { Tag } from '@/components/n/Tag';
import TabBar from '@/components/TabBar';

type DbKey = 'tasks' | 'finance' | 'insights' | 'works';

const TITLES: Record<DbKey, string> = {
  tasks: '태스크',
  finance: '가계부',
  insights: '인사이트',
  works: '웍스',
};

function formatDueLabel(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === -1) return '어제';
  if (diffDays < -1) return `${Math.abs(diffDays)}일 전`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays}일 후`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const STATUS_COLOR: Record<string, string> = {
  '시작 전': 'gray',
  '진행중': 'blue',
  '검토': 'yellow',
  '완료': 'green',
};

function TaskCard({ task, onClick, onToggle }: { task: Task; onClick: () => void; onToggle?: () => void }) {
  const dueLabel = formatDueLabel(task.dueDate);
  const statusLabel = task.done ? '완료' : '진행중';
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--n-surface)',
        borderRadius: 14,
        padding: '12px 14px',
        marginBottom: 8,
        boxShadow: 'var(--sh-1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {onToggle && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            aria-label={task.done ? '완료 취소' : '완료'}
            style={{
              width: 20, height: 20, borderRadius: 4,
              marginTop: 2,
              border: task.done ? 'none' : '1.5px solid var(--n-border-strong)',
              background: task.done ? 'var(--n-accent)' : 'transparent',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {task.done && <Check size={12} color="var(--n-bg)" strokeWidth={2.5} />}
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="t-body"
            style={{
              fontWeight: 500,
              marginBottom: 4,
              color: task.done ? 'var(--n-text-muted)' : 'var(--n-text-strong)',
              textDecoration: task.done ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag color={STATUS_COLOR[statusLabel]}>{statusLabel}</Tag>
            {task.category && <Tag color={task.categoryColor}>#{task.category}</Tag>}
          </div>
        </div>
      </div>
      {dueLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--n-text-muted)', fontSize: 13 }}>
            <Clock size={13} strokeWidth={1.8} />
            {dueLabel}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DbPage() {
  const router = useRouter();
  const params = useParams<{ key: string }>();
  const key = (params?.key || 'tasks') as DbKey;
  const [view, setView] = useState<DbView>('list');

  const { data, loading } = useNotionData<any[]>(key);
  const toggle = useMutation<{ id: string; done: boolean }>('tasks', 'POST');
  const items = data ?? [];

  const subtitle = useMemo(() => {
    if (key === 'tasks') {
      const open = (items as Task[]).filter((t) => !t.done).length;
      return `${open} open · ${items.length} total`;
    }
    return `${items.length}개`;
  }, [items, key]);

  const handleToggle = async (task: Task) => {
    await toggle.mutate({ id: task.id, done: !task.done });
    window.location.reload();
  };

  return (
    <div className="page-content" style={{ minHeight: '100vh' }}>
      <NavBar
        title={TITLES[key] || key}
        subtitle={subtitle}
        large={false}
        left={<BackBtn onClick={() => router.push('/')} />}
        right={
          <>
            <NavIconBtn icon={<Filter />} />
            <NavIconBtn icon={<MoreHorizontal />} />
          </>
        }
      />

      <ViewSwitcher view={view} onChange={setView} />

      <div style={{ flex: 1, padding: '2px 16px 0' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)' }}>불러오는 중…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--n-text-muted)' }}>항목이 없어요</div>
        ) : key === 'tasks' ? (
          (() => {
            const tasks = items as Task[];
            if (view === 'board') {
              const groups: Record<string, Task[]> = { 진행중: [], 검토: [], '시작 전': [], 완료: [] };
              tasks.forEach((t) => {
                const s = t.done ? '완료' : '진행중';
                groups[s].push(t);
              });
              return (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }} className="hide-scroll">
                  {(Object.keys(groups) as Array<keyof typeof groups>).map((st) => (
                    <div key={st} style={{ flex: '0 0 260px', background: 'rgba(255,255,255,0.4)', borderRadius: 14, padding: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px 10px' }}>
                        <Tag color={STATUS_COLOR[st]}>{st}</Tag>
                        <span className="t-footnote">{groups[st].length}</span>
                      </div>
                      {groups[st].map((t) => (
                        <TaskCard key={t.id} task={t} onClick={() => router.push(`/edit/${t.id}`)} onToggle={() => handleToggle(t)} />
                      ))}
                    </div>
                  ))}
                </div>
              );
            }
            if (view === 'cal') {
              return (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <button className="btn btn--sm" onClick={() => router.push('/calendar')}>캘린더 열기</button>
                </div>
              );
            }
            if (view === 'table') {
              return (
                <div style={{ background: 'var(--n-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--sh-1)' }}>
                  <div style={{ overflowX: 'auto' }} className="hide-scroll">
                    <table style={{ borderCollapse: 'collapse', fontSize: 14, minWidth: 420 }}>
                      <thead>
                        <tr style={{ background: 'var(--n-surface-hover)' }}>
                          {['제목', '상태', '카테고리', '마감'].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                textAlign: 'left',
                                padding: '10px 14px',
                                fontWeight: 500,
                                color: 'var(--n-text-muted)',
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                position: i === 0 ? 'sticky' : 'static',
                                left: i === 0 ? 0 : 'auto',
                                background: 'var(--n-surface-hover)',
                                minWidth: i === 0 ? 160 : 90,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t) => (
                          <tr key={t.id} style={{ borderTop: '0.5px solid var(--n-border)' }} onClick={() => router.push(`/edit/${t.id}`)}>
                            <td style={{ padding: '12px 14px', fontWeight: 500, position: 'sticky', left: 0, background: 'var(--n-surface)', minWidth: 160 }}>
                              {t.title}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <Tag color={STATUS_COLOR[t.done ? '완료' : '진행중']}>{t.done ? '완료' : '진행중'}</Tag>
                            </td>
                            <td style={{ padding: '12px 14px' }}>{t.category && <Tag color={t.categoryColor}>{t.category}</Tag>}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--n-text-muted)' }}>{formatDueLabel(t.dueDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
            // list
            return tasks.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => router.push(`/edit/${t.id}`)} onToggle={() => handleToggle(t)} />
            ));
          })()
        ) : key === 'finance' ? (
          (items as FinanceEntry[]).map((f) => (
            <div
              key={f.id}
              onClick={() => router.push(`/edit/${f.id}`)}
              style={{
                background: 'var(--n-surface)',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 8,
                boxShadow: 'var(--sh-1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-body" style={{ fontWeight: 500 }}>{f.client}</div>
                <div className="t-footnote">{f.date ? new Date(f.date).toLocaleDateString('ko-KR') : ''}</div>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: f.type === 'income' ? 'var(--n-tag-green-fg)' : 'var(--n-tag-red-fg)',
                }}
              >
                {f.type === 'income' ? '+' : '-'}₩{f.amount.toLocaleString()}
              </div>
            </div>
          ))
        ) : key === 'insights' || key === 'works' ? (
          (items as (Insight | Work)[]).map((it) => (
            <div
              key={it.id}
              onClick={() => router.push(`/edit/${it.id}`)}
              style={{
                background: 'var(--n-surface)',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 8,
                boxShadow: 'var(--sh-1)',
                cursor: 'pointer',
              }}
            >
              <div className="t-body" style={{ fontWeight: 500, marginBottom: 4 }}>{it.title}</div>
              {it.category && <Tag color={(it as any).coverColor || 'gray'}>{it.category}</Tag>}
            </div>
          ))
        ) : null}
      </div>

      <button
        className="fab"
        style={{ right: 20, bottom: 96 }}
        onClick={() => router.push('/edit/new')}
        aria-label="새로 만들기"
      >
        <Plus size={24} color="var(--n-bg)" />
      </button>

      <TabBar />
    </div>
  );
}
