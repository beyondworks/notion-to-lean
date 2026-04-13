'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Type, Tag, Calendar, Check } from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import { Task } from '@/lib/types';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

type Filter = '전체' | '진행중' | '완료';

const FILTERS: Filter[] = ['전체', '진행중', '완료'];

export default function TasksPage() {
  const { data, loading, error, isMock, refetch } = useNotionData<Task[]>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('전체');

  useEffect(() => {
    if (data) setTasks(data);
  }, [data]);

  const toggleTask = async (id: string) => {
    const prev = [...tasks];
    const target = prev.find((t) => t.id === id);
    if (!target) return;
    const newDone = !target.done;

    setTasks((t) => t.map((task) => (task.id === id ? { ...task, done: newDone } : task)));

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done: newDone }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      setTasks(prev); // revert on failure
    }
  };

  if (loading) return <LoadingSkeleton variant="table" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const undoneCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  const filtered = (() => {
    const undone = tasks.filter((t) => !t.done);
    const done = tasks.filter((t) => t.done);
    if (filter === '진행중') return undone;
    if (filter === '완료') return done;
    return [...undone, ...done];
  })();

  return (
    <>
      {/* ============ MOCK BANNER ============ */}
      {isMock && (
        <div
          style={{
            padding: '4px 20px',
            fontSize: 10,
            color: 'var(--n-ink-45)',
            letterSpacing: '-0.05px',
          }}
        >
          Mock 데이터
        </div>
      )}

      {/* ============ HEADER ============ */}
      <div className="hdr">
        <div className="hdr-topline">
          <div>
            <div className="hdr-hero">태스크</div>
            <div className="hdr-sub">
              <CheckCircle2 size={11} style={{ color: 'var(--n-red-tx)' }} />
              {tasks.length}개
              <span className="dot" />
              미완료 {undoneCount}개
            </div>
          </div>
        </div>
      </div>

      {/* ============ FILTER PILLS ============ */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '12px 20px 4px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: active ? 'var(--n-ink)' : 'var(--n-surface)',
                color: active ? '#fff' : 'var(--n-ink-60)',
                border: active ? '1px solid var(--n-ink)' : '1px solid var(--n-border)',
                transition: 'background 0.12s, color 0.12s, border-color 0.12s',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* ============ TASK TABLE ============ */}
      <div style={{ marginTop: 12 }}>
        <div className="db-card">
          {/* Header */}
          <div className="db-head">
            <div className="h-icon" />
            <div className="h-name">
              <span><Type size={8} /> 이름</span>
            </div>
            <div className="h-prop">
              <span><Tag size={8} /> 분류</span>
            </div>
            <div className="h-date">
              <span><Calendar size={8} /> 마감</span>
            </div>
          </div>

          {/* Rows */}
          {filtered.length === 0 && (
            <div
              style={{
                padding: '24px 13px',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--n-ink-45)',
              }}
            >
              {filter === '완료' ? '완료된 태스크가 없습니다' : '진행중인 태스크가 없습니다'}
            </div>
          )}

          {filtered.map((task) => (
            <div key={task.id} className="db-row">
              <button
                className={`db-chk${task.done ? ' done' : ''}`}
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? '완료 취소' : '완료 처리'}
              >
                {task.done && <Check size={7} />}
              </button>
              <div className={`db-title${task.done ? ' strike' : ''}`}>
                {task.title}
              </div>
              <div className="db-prop">
                <span className={`n-tag ${task.categoryColor}`}>{task.category}</span>
              </div>
              <div className="db-date">
                {task.dueDate ?? '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ DONE SUMMARY ============ */}
      {filter !== '진행중' && doneCount > 0 && filter !== '완료' && (
        <div
          style={{
            padding: '10px 20px 0',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--n-ink-45)',
            letterSpacing: '-0.05px',
          }}
        >
          완료 {doneCount}개
        </div>
      )}
    </>
  );
}
