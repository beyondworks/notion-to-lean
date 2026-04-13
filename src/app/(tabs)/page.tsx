'use client';

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
  FileText,
  Clock,
  BarChart3,
  Zap,
} from 'lucide-react';

/* ── Mock Data ── */
const TASKS = [
  { id: '1', title: 'Stitch 디자인 시스템 정리', done: true },
  { id: '2', title: 'Notion API 연동 테스트', done: true },
  { id: '3', title: '대시보드 위젯 레이아웃', done: false },
  { id: '4', title: '사용자 온보딩 플로우 작성', done: false },
  { id: '5', title: '주간 리포트 자동화', done: false },
];

const MEMOS = [
  { id: '1', title: '프로젝트 회고 - Q1', subtitle: '2026년 1분기 성과 정리', color: '#e7e2d9' },
  { id: '2', title: 'API 아키텍처 메모', subtitle: 'Notion + Vercel 통합 구조', color: '#dbeafe' },
  { id: '3', title: '디자인 리서치 노트', subtitle: 'M3 컬러 시스템 분석', color: '#fce7d6' },
];

const FOCUS_AREAS = [
  { icon: Palette, label: 'Design', bg: 'rgba(0, 103, 137, 0.08)', color: '#006789' },
  { icon: Briefcase, label: 'Work', bg: 'rgba(97, 94, 87, 0.08)', color: '#615e57' },
  { icon: Wallet, label: 'Finance', bg: 'rgba(158, 66, 44, 0.08)', color: '#9e422c' },
  { icon: Lightbulb, label: 'Insights', bg: 'rgba(0, 103, 137, 0.08)', color: '#006789' },
];

export default function HomePage() {
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabel = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  const doneCount = TASKS.filter((t) => t.done).length;
  const donePct = Math.round((doneCount / TASKS.length) * 100);

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Top App Bar ── */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-icon">
            <LayoutGrid />
          </div>
          <span className="top-bar-title">Beyondworks</span>
        </div>
        <div className="top-bar-avatar">
          <User />
        </div>
      </header>

      {/* ── Welcome Section ── */}
      <section className="welcome anim-in">
        <p className="welcome-label">{dayLabel}</p>
        <h1 className="welcome-title">Good Morning.</h1>
      </section>

      {/* ── Bento Grid ── */}
      <section style={{ marginTop: 28 }}>
        <div className="bento-grid">

          {/* Calendar Widget (1x1) */}
          <div className="card anim-in anim-in-d1" style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar style={{ width: 14, height: 14, color: 'var(--ink-outline)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>Calendar</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: 'var(--ink)' }}>
                {today.getDate()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--error)', marginTop: 4 }}>
                {monthNames[today.getMonth()]}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginBottom: 6 }}>
                3 events today
              </div>
              <div style={{ height: 4, borderRadius: 9999, background: 'var(--surface-container)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '65%', borderRadius: 9999, background: 'var(--tertiary)' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-outline)', marginTop: 4 }}>Next: Team sync in 45m</div>
            </div>
          </div>

          {/* Quick Stat Widget (1x1) */}
          <div className="card anim-in anim-in-d2" style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(0, 103, 137, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <ListChecks style={{ width: 18, height: 18, color: 'var(--tertiary)' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>
                Pending
              </div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1, color: 'var(--ink)' }}>
                {TASKS.filter((t) => !t.done).length}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginTop: 4 }}>
                tasks remaining
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
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>Immediate Actions</span>
              </div>
              <span className="pill active" style={{ fontSize: 10 }}>{donePct}% DONE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TASKS.map((task) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={`task-check${task.done ? ' checked' : ''}`}>
                    {task.done && <Check />}
                  </div>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: '-0.2px',
                    color: task.done ? 'var(--ink-outline)' : 'var(--ink)',
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insight Cards (2-col span, grid 2) */}
          <div className="span-2 anim-in anim-in-d4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Insight 1 */}
            <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 100, background: 'linear-gradient(135deg, #006789, #5acafe)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>AI</span>
                </div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                  Weekly Focus Report
                </div>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 100, background: 'linear-gradient(135deg, #9e422c, #fe8b70)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>Trend</span>
                </div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                  Productivity Insights
                </div>
              </div>
            </div>
          </div>

          {/* Progress Widget (1x1) */}
          <div className="card anim-in anim-in-d5" style={{ aspectRatio: '1', padding: 16, background: 'var(--tertiary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>Focus Time</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>+24%</div>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>vs last week</div>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 12, height: 28 }}>
                {[40, 65, 45, 70, 55, 80, 90].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: `rgba(255,255,255,${i === 6 ? 1 : 0.35})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Time Widget (1x1) */}
          <div className="card anim-in anim-in-d5" style={{ aspectRatio: '1', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--ink-outline)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>Time</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>
                4.5<span style={{ fontSize: 16, fontWeight: 600 }}>h</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-variant)', marginTop: 4 }}>deep work today</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Memo Archive ── */}
      <section style={{ marginTop: 32 }} className="anim-in anim-in-d5">
        <div className="section-label">Memo Archive</div>
        <div className="card" style={{ margin: '0 20px' }}>
          {MEMOS.map((memo, idx) => (
            <div key={memo.id} className="list-row" style={{ cursor: 'pointer' }}>
              <div className="list-row-thumb" style={{ background: memo.color }} />
              <div className="list-row-content">
                <div className="list-row-title">{memo.title}</div>
                <div className="list-row-subtitle">{memo.subtitle}</div>
              </div>
              <ChevronRight style={{ width: 18, height: 18, color: 'var(--ink-outline-variant)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Focus Areas ── */}
      <section style={{ marginTop: 32 }} className="anim-in anim-in-d6">
        <div className="section-label">Focus Areas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 20px' }}>
          {FOCUS_AREAS.map((area) => (
            <div key={area.label} className="focus-tile">
              <div className="focus-tile-icon" style={{ background: area.bg, color: area.color }}>
                <area.icon />
              </div>
              <span className="focus-tile-label">{area.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Card ── */}
      <section style={{ marginTop: 32 }} className="anim-in anim-in-d6">
        <div className="cta-card">
          <h3>Curate your<br />digital mind.</h3>
          <button>Create New</button>
        </div>
      </section>

      {/* spacer for bottom nav */}
      <div style={{ height: 32 }} />

      {/* ── FAB ── */}
      <button className="fab">
        <Plus />
      </button>
    </div>
  );
}
