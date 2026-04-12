'use client';

import { useState } from 'react';
import { CheckCircle2, Type, Tag, Calendar, Check } from 'lucide-react';

type Filter = '전체' | '진행중' | '완료';

interface Task {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  dateWarn: boolean;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: '해커스 2차시 수정본 전달', category: '강의', categoryColor: 'green', date: '4/8', dateWarn: true, done: false },
  { id: 't2', title: '매직라이트 영상 업로드', category: 'Video', categoryColor: 'orange', date: '4/8', dateWarn: true, done: false },
  { id: 't3', title: 'Magiclight 영상 최종 게시', category: 'Video', categoryColor: 'orange', date: '4/14', dateWarn: false, done: false },
  { id: 't4', title: '프로젝트 A 기획서 검토', category: '기획', categoryColor: 'blue', date: '4/15', dateWarn: false, done: false },
  { id: 't5', title: '디자인 시스템 정리', category: '디자인', categoryColor: 'purple', date: '4/16', dateWarn: false, done: false },
  { id: 't6', title: '세븐플러스 미팅', category: '회의', categoryColor: 'gray', date: '4/10', dateWarn: false, done: true },
  { id: 't7', title: 'RelayAX 마곡 미팅', category: '회의', categoryColor: 'gray', date: '4/7', dateWarn: false, done: true },
  { id: 't8', title: 'Notion DB 연동 범위 확정', category: '기획', categoryColor: 'blue', date: '4/5', dateWarn: false, done: true },
];

const FILTERS: Filter[] = ['전체', '진행중', '완료'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>('전체');

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

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
              <div className={`db-date${task.dateWarn && !task.done ? ' warn' : ''}`}>
                {task.date}
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
