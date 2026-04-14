'use client';

import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Calendar,
  ListChecks,
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import type { Task, Insight } from '@/lib/types';

export default function TasksPage() {
  const router = useRouter();
  const { data: tasks, loading: tasksLoading } = useNotionData<Task[]>('tasks');
  const { data: insights, loading: insightsLoading } = useNotionData<Insight[]>('insights');

  const taskList = tasks ?? [];
  const insightList = insights ?? [];

  const pendingCount = taskList.filter((t) => !t.done).length;
  const doneCount = taskList.filter((t) => t.done).length;
  const totalTasks = taskList.length;
  const goalPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const WIDGETS = [
    {
      title: 'Calendar',
      desc: 'Upcoming events & schedule',
      icon: Calendar,
      bg: 'rgba(0, 103, 137, 0.08)',
      color: 'var(--tertiary)',
      stat: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      onClick: () => {},
    },
    {
      title: 'Tasks',
      desc: 'Track your to-dos',
      icon: ListChecks,
      bg: 'rgba(158, 66, 44, 0.08)',
      color: 'var(--error)',
      stat: tasksLoading ? '...' : `${pendingCount} pending`,
      onClick: () => router.push('/'),
    },
    {
      title: 'Analytics',
      desc: 'Weekly performance data',
      icon: BarChart3,
      bg: 'rgba(97, 94, 87, 0.08)',
      color: 'var(--primary)',
      stat: '+24%',
      onClick: () => {},
    },
    {
      title: 'Focus Timer',
      desc: 'Deep work sessions',
      icon: Clock,
      bg: 'rgba(0, 103, 137, 0.08)',
      color: 'var(--tertiary)',
      stat: '4.5h today',
      onClick: () => {},
    },
    {
      title: 'Quick Actions',
      desc: 'Shortcuts & automations',
      icon: Zap,
      bg: 'rgba(158, 66, 44, 0.08)',
      color: 'var(--error)',
      stat: `${totalTasks} tasks`,
      onClick: () => router.push('/'),
    },
    {
      title: 'Insights',
      desc: 'Productivity insights',
      icon: TrendingUp,
      bg: 'rgba(97, 94, 87, 0.08)',
      color: 'var(--primary)',
      stat: insightsLoading ? '...' : `${insightList.length} items`,
      onClick: () => {},
    },
    {
      title: 'Notes',
      desc: 'Recent memo archive',
      icon: FileText,
      bg: 'rgba(0, 103, 137, 0.08)',
      color: 'var(--tertiary)',
      stat: insightsLoading ? '...' : `${insightList.length} notes`,
      onClick: () => {},
    },
    {
      title: 'Goals',
      desc: 'Monthly objectives',
      icon: LayoutGrid,
      bg: 'rgba(158, 66, 44, 0.08)',
      color: 'var(--error)',
      stat: tasksLoading ? '...' : `${goalPct}%`,
      onClick: () => {},
    },
  ];

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-icon">
            <LayoutGrid />
          </div>
          <span className="top-bar-title">Widgets</span>
        </div>
      </header>

      {/* Hero */}
      <section className="welcome anim-in">
        <p className="welcome-label">Customize</p>
        <h1 className="welcome-title">Widget Gallery</h1>
      </section>

      <p style={{ padding: '12px 20px 0', fontSize: 13, color: 'var(--ink-variant)', letterSpacing: '-0.2px', lineHeight: 1.5 }} className="anim-in anim-in-d1">
        Add widgets to your dashboard to keep track of what matters most.
      </p>

      {/* Widget Grid */}
      <section style={{ marginTop: 24 }}>
        <div className="bento-grid">
          {WIDGETS.map((widget, idx) => (
            <div
              key={widget.title}
              className={`card anim-in anim-in-d${Math.min(idx + 1, 6)}`}
              style={{ padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}
              onClick={widget.onClick}
            >
              <div>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-md)',
                  background: widget.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <widget.icon style={{ width: 18, height: 18, color: widget.color }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 2 }}>
                  {widget.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-variant)', lineHeight: 1.3 }}>
                  {widget.desc}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <span className="pill" style={{ fontSize: 10 }}>{widget.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
