'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  User,
  Calendar,
  ListChecks,
  Check,
  ChevronRight,
  Plus,
  Palette,
  Briefcase,
  Wallet,
  Lightbulb,
  Clock,
  Zap,
} from 'lucide-react';
import { useNotionData, useMutation } from '@/lib/hooks';
import type { Task, Insight, FinanceEntry, Work } from '@/lib/types';
import CreateSheet from '@/components/CreateSheet';
import { useToast } from '@/components/Toast';

type TaskFilter = '오늘' | '이번 주' | '지연' | '완료';
type SheetTab = 'task' | 'memo' | 'project' | 'expense';

interface WeeklyMetrics {
  thisWeekDone: number;
  lastWeekDone: number;
  dailyDone: number[];
  todayDone: number;
  urgentCount: number;
  pendingCount: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; tx: string }> = {
  gray: { bg: 'var(--surface-container)', tx: 'var(--ink-variant)' },
  blue: { bg: 'rgba(0,103,137,0.1)', tx: '#006789' },
  green: { bg: 'rgba(68,131,97,0.1)', tx: '#448361' },
  orange: { bg: 'rgba(217,115,13,0.1)', tx: '#d9730d' },
  red: { bg: 'rgba(158,66,44,0.1)', tx: '#9e422c' },
  purple: { bg: 'rgba(144,101,176,0.1)', tx: '#9065b0' },
  pink: { bg: 'rgba(193,76,138,0.1)', tx: '#c14c8a' },
  yellow: { bg: 'rgba(203,145,47,0.1)', tx: '#cb9101' },
  brown: { bg: 'rgba(159,107,83,0.1)', tx: '#9f6b53' },
  default: { bg: 'var(--surface-container)', tx: 'var(--ink-variant)' },
};

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function getCategoryColor(color: string) {
  return CATEGORY_COLORS[color] || CATEGORY_COLORS.default;
}

const INSIGHT_GRADIENTS = [
  'linear-gradient(135deg, #006789, #5acafe)',
  'linear-gradient(135deg, #9e422c, #fe8b70)',
  'linear-gradient(135deg, #a78bfa, #7c3aed)',
  'linear-gradient(135deg, #93c5fd, #2563eb)',
];

function getCTAMessage(hour: number) {
  if (hour < 11) return { title: '오늘의 할 일을\n정리해봐요.', button: '오늘 계획', tab: 'task' as SheetTab };
  if (hour < 14) return { title: '오전 성과를\n기록해보세요.', button: '진행 상황 기록', tab: 'memo' as SheetTab };
  if (hour < 18) return { title: '오후 집중\n시간이에요.', button: '빠른 메모', tab: 'memo' as SheetTab };
  if (hour < 22) return { title: '내일 준비를\n해보세요.', button: '내일 일정 추가', tab: 'task' as SheetTab };
  return { title: '오늘 하루\n어떠셨나요?', button: '회고 작성', tab: 'memo' as SheetTab };
}

export default function HomePage() {
  const router = useRouter();
  const { data: tasks, loading: tasksLoading, isMock: tasksMock, refetch: refetchTasks } = useNotionData<Task[]>('tasks');
  const { data: insights, loading: insightsLoading, isMock: insightsMock } = useNotionData<Insight[]>('insights');
  const { data: finance } = useNotionData<FinanceEntry[]>('finance');
  const { data: works } = useNotionData<Work[]>('works');
  const { data: weeklyMetrics } = useNotionData<WeeklyMetrics>('metrics/weekly');
  const toggleMutation = useMutation('tasks', 'POST');
  const { toast, showToast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<SheetTab>('task');
  const [localTasks, setLocalTasks] = useState<Task[] | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('오늘');

  const taskList = localTasks ?? tasks ?? [];
  const insightList = insights ?? [];
  const financeList = finance ?? [];
  const workList = works ?? [];
  const isMock = tasksMock || insightsMock;

  const today = new Date();
  const todayStart = startOfDay(today);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabel = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  // ---- Calendar widget: next upcoming event + day progress ----
  const upcomingEvents = useMemo(() => {
    return taskList
      .filter((t) => t.dueDate && !t.done && new Date(t.dueDate) >= todayStart)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  const nextEvent = upcomingEvents[0];
  const todayEventsCount = useMemo(() => {
    return taskList.filter((t) => {
      if (!t.dueDate) return false;
      const d = startOfDay(new Date(t.dueDate));
      return d.getTime() === todayStart.getTime();
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  const dayProgressPct = Math.round(((today.getHours() * 60 + today.getMinutes()) / (24 * 60)) * 100);

  // ---- Pending widget: due within 3 days ----
  const urgentCount = useMemo(() => {
    const threshold = new Date(todayStart);
    threshold.setDate(threshold.getDate() + 3);
    return taskList.filter((t) => {
      if (t.done || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due <= threshold;
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  const pendingCount = useMemo(() => taskList.filter((t) => !t.done).length, [taskList]);

  const urgentColor = urgentCount === 0
    ? 'var(--tertiary)'
    : urgentCount <= 2
    ? '#d9730d'
    : 'var(--error)';

  // ---- Task list filtering ----
  const filteredTasks = useMemo(() => {
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    switch (taskFilter) {
      case '오늘': {
        // today's tasks + overdue incomplete
        const list = taskList.filter((t) => {
          if (t.done) return false;
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          const dueStart = startOfDay(due);
          if (dueStart.getTime() === todayStart.getTime()) return true;
          if (due < todayStart) return true; // overdue
          return false;
        });
        return list.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      }
      case '이번 주': {
        const list = taskList.filter((t) => {
          if (t.done || !t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due <= weekEnd;
        });
        return list.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      }
      case '지연': {
        const list = taskList.filter((t) => {
          if (t.done || !t.dueDate) return false;
          return new Date(t.dueDate) < todayStart;
        });
        return list.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      }
      case '완료': {
        // done tasks, most recent first (by dueDate as proxy)
        const list = taskList.filter((t) => t.done);
        return list.sort((a, b) => {
          const aT = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bT = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return bT - aT;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList, taskFilter]);

  const displayTasks = filteredTasks.slice(0, 10);

  // ---- Badge in the task list header (context-aware per filter) ----
  const taskBadge = useMemo(() => {
    switch (taskFilter) {
      case '오늘': {
        const todayAll = taskList.filter((t) => {
          if (!t.dueDate) return false;
          return startOfDay(new Date(t.dueDate)).getTime() === todayStart.getTime();
        });
        const done = todayAll.filter((t) => t.done).length;
        const total = todayAll.length || 1;
        return `${Math.round((done / total) * 100)}% DONE`;
      }
      case '이번 주': {
        const weekEnd = new Date(todayStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekAll = taskList.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return d <= weekEnd && d >= todayStart;
        });
        const done = weekAll.filter((t) => t.done).length;
        const total = weekAll.length || 1;
        return `${Math.round((done / total) * 100)}% DONE`;
      }
      case '지연': {
        const overdue = taskList.filter((t) => !t.done && t.dueDate && new Date(t.dueDate) < todayStart).length;
        return `${overdue} OVERDUE`;
      }
      case '완료': {
        return `${taskList.filter((t) => t.done).length} COMPLETED`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList, taskFilter]);

  // ---- Focus area badges ----
  const financeMonthTotal = useMemo(() => {
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    return financeList
      .filter((f) => f.date && new Date(f.date) >= monthStart && f.type === 'expense')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financeList]);

  const insightsCount = insightList.length;
  const worksProgressCount = workList.filter((w) => w.status === 'progress').length;

  const formatWon = (n: number): string => {
    if (n >= 10000) return `${Math.round(n / 10000)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const FOCUS_AREAS = [
    { icon: Briefcase, label: '태스크', bg: 'rgba(97, 94, 87, 0.08)', color: '#615e57', href: '/db/tasks', badge: String(pendingCount) },
    { icon: Wallet, label: '가계부', bg: 'rgba(158, 66, 44, 0.08)', color: '#9e422c', href: '/db/finance', badge: financeMonthTotal > 0 ? `₩${formatWon(financeMonthTotal)}` : '0' },
    { icon: Lightbulb, label: '인사이트', bg: 'rgba(0, 103, 137, 0.08)', color: '#006789', href: '/db/insights', badge: String(insightsCount) },
    { icon: Palette, label: '웍스', bg: 'rgba(0, 103, 137, 0.08)', color: '#006789', href: '/db/works', badge: String(worksProgressCount) },
  ];

  // ---- Focus time widget: weekly completion rate change ----
  const weeklyChangePct = useMemo(() => {
    if (!weeklyMetrics) return null;
    const { thisWeekDone, lastWeekDone } = weeklyMetrics;
    if (lastWeekDone === 0) return thisWeekDone > 0 ? 100 : 0;
    return Math.round(((thisWeekDone - lastWeekDone) / lastWeekDone) * 100);
  }, [weeklyMetrics]);

  const dailyBars = useMemo(() => {
    if (!weeklyMetrics) return [40, 65, 45, 70, 55, 80, 90];
    const max = Math.max(...weeklyMetrics.dailyDone, 1);
    return weeklyMetrics.dailyDone.map((n) => Math.max(8, Math.round((n / max) * 100)));
  }, [weeklyMetrics]);

  // ---- Time widget: tasks completed today ----
  const completedToday = useMemo(() => {
    return taskList.filter((t) => {
      if (!t.done) return false;
      if (!t.dueDate) return false;
      return startOfDay(new Date(t.dueDate)).getTime() === todayStart.getTime();
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  const todayDoneCount = weeklyMetrics?.todayDone ?? completedToday;

  // ---- Next upcoming event title (truncated) ----
  const nextEventLabel = useMemo(() => {
    if (!nextEvent) return monthNames[today.getMonth()];
    const t = nextEvent.title;
    return t.length > 15 ? `${t.slice(0, 15)}…` : t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextEvent]);

  // ---- CTA context-aware ----
  const cta = useMemo(() => getCTAMessage(today.getHours()), [today]);

  // ---- Handlers ----
  const handleToggle = useCallback(async (task: Task) => {
    const updated = taskList.map((t) =>
      t.id === task.id ? { ...t, done: !t.done } : t,
    );
    setLocalTasks(updated);

    const result = await toggleMutation.mutate({ id: task.id, done: !task.done });
    if (!result) {
      setLocalTasks(taskList);
      showToast('Failed to update task');
    } else {
      showToast(task.done ? 'Task reopened' : 'Task completed');
    }
  }, [taskList, toggleMutation, showToast]);

  const handleCreated = useCallback((msg: string) => {
    showToast(msg);
    setLocalTasks(null);
    refetchTasks();
  }, [showToast, refetchTasks]);

  const openSheet = useCallback((tab: SheetTab = 'task') => {
    setSheetDefaultTab(tab);
    setSheetOpen(true);
  }, []);

  // Sorted insights by lastEditedAt desc
  const sortedInsights = useMemo(() => {
    return [...insightList].sort((a, b) => {
      const aT = a.lastEditedAt ? new Date(a.lastEditedAt).getTime() : 0;
      const bT = b.lastEditedAt ? new Date(b.lastEditedAt).getTime() : 0;
      return bT - aT;
    });
  }, [insightList]);
  const firstTwoInsights = sortedInsights.slice(0, 2);

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top App Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-icon">
            <LayoutGrid />
          </div>
          <span className="top-bar-title">Beyondworks</span>
          {isMock && <span className="demo-pill">Demo</span>}
        </div>
        <div className="top-bar-avatar">
          <User />
        </div>
      </header>

      {/* Welcome Section */}
      <section className="welcome anim-in">
        <p className="welcome-label">{dayLabel}</p>
        <h1 className="welcome-title">Good Morning.</h1>
      </section>

      {/* Bento Grid */}
      <section style={{ marginTop: 28 }}>
        <div className="bento-grid">

          {/* Calendar Widget (1x1) */}
          <div
            className="card anim-in anim-in-d1"
            onClick={() => router.push('/db/tasks')}
            style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar style={{ width: 14, height: 14, color: 'var(--ink-outline)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>Calendar</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: 'var(--ink)' }}>
                {today.getDate()}
              </div>
              <div
                title={nextEvent?.title ?? ''}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: nextEvent ? 'var(--tertiary)' : 'var(--error)',
                  marginTop: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {nextEventLabel}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginBottom: 6 }}>
                오늘 이벤트 {todayEventsCount}개
              </div>
              <div style={{ height: 4, borderRadius: 9999, background: 'var(--surface-container)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dayProgressPct}%`, borderRadius: 9999, background: 'var(--tertiary)' }} />
              </div>
            </div>
          </div>

          {/* Pending Widget (1x1) */}
          <div
            className="card anim-in anim-in-d2"
            onClick={() => router.push('/db/tasks?urgent=3d')}
            style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(0, 103, 137, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <ListChecks style={{ width: 18, height: 18, color: 'var(--tertiary)' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>
                Pending
              </div>
            </div>
            <div>
              {tasksLoading ? (
                <div className="skeleton" style={{ height: 36, width: 48 }} />
              ) : (
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1, color: urgentColor }}>
                  {urgentCount}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginTop: 4 }}>
                3일 이내 마감
              </div>
            </div>
          </div>

          {/* Task List (2-col span) */}
          <div className="card span-2 anim-in anim-in-d3" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'rgba(158, 66, 44, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap style={{ width: 14, height: 14, color: 'var(--error)' }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>오늘 할 일</span>
              </div>
              {!tasksLoading && (
                <span className="pill active" style={{ fontSize: 10 }}>{taskBadge}</span>
              )}
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }} className="hide-scrollbar">
              {(['오늘', '이번 주', '지연', '완료'] as const).map((f) => (
                <button key={f} className={`pill${taskFilter === f ? ' active' : ''}`} onClick={() => setTaskFilter(f)}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasksLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="skeleton" style={{ width: 22, height: 22, borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 16, flex: 1 }} />
                  </div>
                ))
              ) : displayTasks.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-variant)', padding: '12px 0' }}>
                  {taskFilter === '오늘' ? '오늘 할 일이 없어요' : taskFilter === '지연' ? '지연된 태스크 없음' : taskFilter === '완료' ? '완료한 태스크 없음' : '이번 주 일정 없음'}
                </div>
              ) : (
                displayTasks.map((task) => {
                  const catColor = getCategoryColor(task.categoryColor);
                  const dateStr = formatDate(task.dueDate);
                  const overdue = !task.done && isOverdue(task.dueDate);
                  return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className={`task-check${task.done ? ' checked' : ''}`}
                        onClick={() => handleToggle(task)}
                      >
                        {task.done && <Check />}
                      </div>
                      <span
                        onClick={() => router.push(`/edit/${task.id}`)}
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: 500,
                          letterSpacing: '-0.2px',
                          color: task.done ? 'var(--ink-outline)' : 'var(--ink)',
                          textDecoration: task.done ? 'line-through' : 'none',
                          cursor: 'pointer',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.category && (
                        <span className="pill" style={{ background: catColor.bg, color: catColor.tx, fontSize: 10, flexShrink: 0 }}>
                          {task.category}
                        </span>
                      )}
                      {dateStr && (
                        <span style={{ fontSize: 12, fontWeight: 500, color: overdue ? 'var(--error)' : 'var(--ink-variant)', flexShrink: 0 }}>
                          {dateStr}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* View all link */}
            {!tasksLoading && filteredTasks.length > 10 && (
              <div
                onClick={() => router.push('/tasks')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--tertiary)' }}
              >
                <span>전체 보기</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </div>
            )}
          </div>

          {/* Insight Cards (2-col span) */}
          <div className="span-2 anim-in anim-in-d4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {insightsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 100 }} />
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  </div>
                </div>
              ))
            ) : (
              firstTwoInsights.map((insight, idx) => (
                <div
                  key={insight.id}
                  className="card"
                  onClick={() => router.push(`/edit/${insight.id}`)}
                  style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = '')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                  onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = '')}
                >
                  <div style={{ height: 100, background: insight.coverColor || INSIGHT_GRADIENTS[idx % INSIGHT_GRADIENTS.length], position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>
                        {insight.category || '인사이트'}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                      {insight.title}
                    </div>
                  </div>
                </div>
              ))
            )}
            {!insightsLoading && insightList.length > 2 && (
              <div
                onClick={() => router.push('/insights')}
                style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--tertiary)' }}
              >
                <span>{insightList.length}개 인사이트 전체 보기</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </div>
            )}
            {!insightsLoading && firstTwoInsights.length === 0 && (
              <>
                <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: 100, background: INSIGHT_GRADIENTS[0], position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>AI</span>
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>Weekly Focus Report</div>
                  </div>
                </div>
                <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: 100, background: INSIGHT_GRADIENTS[1], position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>Trend</span>
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>Productivity Insights</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Focus Time Widget (1x1) */}
          <div
            className="card anim-in anim-in-d5"
            onClick={() => router.push('/db/tasks?filter=완료')}
            style={{ aspectRatio: '1', padding: 16, background: 'var(--tertiary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none', cursor: 'pointer' }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>완료율</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>
                {weeklyChangePct === null ? '—' : `${weeklyChangePct >= 0 ? '+' : ''}${weeklyChangePct}%`}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>지난 주 대비</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 12, height: 28 }}>
                {dailyBars.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: `rgba(255,255,255,${i === 6 ? 1 : 0.35})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Time (Today Done) Widget (1x1) */}
          <div
            className="card anim-in anim-in-d5"
            onClick={() => router.push('/db/tasks?filter=완료&today=true')}
            style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--ink-outline)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>오늘 완료</span>
              </div>
            </div>
            <div>
              {todayDoneCount === 0 ? (
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-outline)' }}>아직 없음</div>
              ) : (
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>
                  {todayDoneCount}
                  <span style={{ fontSize: 16, fontWeight: 600 }}> 완료</span>
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginTop: 4 }}>개 태스크 완료</div>
            </div>
          </div>

        </div>
      </section>

      {/* Focus Areas */}
      <section style={{ marginTop: 32 }} className="anim-in anim-in-d6">
        <div className="section-label">Focus Areas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 20px' }}>
          {FOCUS_AREAS.map((area) => (
            <div
              key={area.label}
              className="focus-tile"
              onClick={() => router.push(area.href)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  fontSize: 10,
                  padding: '2px 6px',
                  background: area.bg,
                  color: area.color,
                  borderRadius: 4,
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {area.badge}
              </div>
              <div className="focus-tile-icon" style={{ background: area.bg, color: area.color }}>
                <area.icon />
              </div>
              <span className="focus-tile-label">{area.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Card */}
      <section style={{ marginTop: 32 }} className="anim-in anim-in-d6">
        <div className="cta-card">
          <h3 style={{ whiteSpace: 'pre-line' }}>{cta.title}</h3>
          <button onClick={() => openSheet(cta.tab)}>{cta.button}</button>
        </div>
      </section>

      {/* spacer for bottom nav */}
      <div style={{ height: 32 }} />

      {/* FAB */}
      <button className="fab" onClick={() => openSheet('task')}>
        <Plus />
      </button>

      {/* Create Bottom Sheet */}
      <CreateSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={handleCreated}
        defaultTab={sheetDefaultTab}
      />

      {toast}
    </div>
  );
}
