'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw, Moon, Sun, Target, Hammer, ClipboardList, Search as SearchIcon } from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import type { Task, Insight, Work } from '@/lib/types';
import { NavBar, NavIconBtn } from '@/components/n/NavBar';
import { useTheme } from '@/components/n/useTheme';

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return '종일';
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function relativeLabel(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7) return `${diff}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function tagColorFor(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('design') || lower.includes('디자인')) return 'blue';
  if (lower.includes('dev') || lower.includes('api') || lower.includes('claude')) return 'purple';
  if (lower.includes('research') || lower.includes('리서치') || lower.includes('scrap')) return 'green';
  if (lower.includes('meeting') || lower.includes('미팅')) return 'brown';
  if (lower.includes('copy') || lower.includes('brand')) return 'yellow';
  if (lower.includes('urgent') || lower.includes('긴급') || lower.includes('release')) return 'red';
  if (lower.includes('marketing')) return 'pink';
  if (lower.includes('ai')) return 'purple';
  return 'gray';
}

// Pick a Notion-style icon for recent page entries based on category
function pickRecentIcon(category: string) {
  const lower = (category || '').toLowerCase();
  if (lower.includes('design')) return { emoji: '🎯', Icon: Target };
  if (lower.includes('build') || lower.includes('sprint')) return { emoji: '🔨', Icon: Hammer };
  if (lower.includes('checklist') || lower.includes('release')) return { emoji: '📋', Icon: ClipboardList };
  if (lower.includes('research') || lower.includes('note')) return { emoji: '🔍', Icon: SearchIcon };
  return { emoji: '📄', Icon: ClipboardList };
}

export default function HomePage() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const { data: tasks, loading: tasksLoading } = useNotionData<Task[]>('tasks');
  const { data: insights } = useNotionData<Insight[]>('insights');
  const { data: works } = useNotionData<Work[]>('works');

  const taskList = tasks ?? [];
  const insightList = insights ?? [];
  const workList = works ?? [];

  const today = new Date();
  const todayStart = startOfDay(today);

  const todayEvents = useMemo(() => {
    return taskList
      .filter((t) => {
        if (!t.dueDate) return false;
        return startOfDay(new Date(t.dueDate)).getTime() === todayStart.getTime();
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  const recentPages = useMemo(() => {
    const all: Array<{ id: string; title: string; category: string; at?: string }> = [
      ...insightList.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category || '인사이트',
        at: i.lastEditedAt,
      })),
      ...workList.map((w) => ({
        id: w.id,
        title: w.title,
        category: w.category || 'Works',
        at: undefined,
      })),
    ];
    return all
      .sort((a, b) => {
        const aT = a.at ? new Date(a.at).getTime() : 0;
        const bT = b.at ? new Date(b.at).getTime() : 0;
        return bT - aT;
      })
      .slice(0, 4);
  }, [insightList, workList]);

  const subtitle = `${DAY_NAMES_EN[today.getDay()]} · ${MONTH_NAMES_EN[today.getMonth()]} ${today.getDate()}`;

  return (
    <div className="page-content" style={{ minHeight: 'var(--app-vh)' }}>
      <NavBar
        title="안녕하세요, 현우"
        subtitle={subtitle}
        right={
          <>
            <NavIconBtn icon={<RotateCw />} onClick={() => window.location.reload()} ariaLabel="새로고침" />
            <NavIconBtn icon={dark ? <Sun /> : <Moon />} onClick={toggle} ariaLabel="다크 모드" />
          </>
        }
      />

      {/* Today */}
      <div className="g-header anim-in">오늘</div>
      <div className="g-list anim-in">
        {tasksLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="g-row">
              <div className="skeleton" style={{ width: 3, alignSelf: 'stretch' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 4 }} />
                <div className="skeleton" style={{ height: 12, width: '30%' }} />
              </div>
            </div>
          ))
        ) : todayEvents.length === 0 ? (
          <div className="g-row" style={{ justifyContent: 'center' }}>
            <span className="t-footnote">오늘 일정이 없어요</span>
          </div>
        ) : (
          todayEvents.map((e) => {
            const color = tagColorFor(e.category || '');
            return (
              <div
                key={e.id}
                className="g-row"
                onClick={() => router.push(`/edit/${e.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: 3,
                    alignSelf: 'stretch',
                    borderRadius: 2,
                    background: `var(--n-tag-${color}-fg)`,
                    margin: '2px 4px 2px 0',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="t-headline"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {e.title}
                  </div>
                  <div className="t-footnote">{formatTime(e.dueDate)}</div>
                </div>
                <div className="chev" />
              </div>
            );
          })
        )}
      </div>

      {/* Recent */}
      <div className="g-header anim-in anim-in-d1" style={{ marginTop: 18 }}>최근</div>
      <div className="g-list anim-in anim-in-d1">
        {recentPages.length === 0 ? (
          <div className="g-row" style={{ justifyContent: 'center' }}>
            <span className="t-footnote">최근 페이지 없음</span>
          </div>
        ) : (
          recentPages.map((r) => {
            const ico = pickRecentIcon(r.category || '');
            return (
              <div
                key={r.id}
                className="g-row g-row--with-icon"
                onClick={() => router.push(`/edit/${r.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="icon-tile" style={{ fontSize: 15 }}>
                  {ico.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="t-body"
                    style={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.title}
                  </div>
                  <div className="t-footnote">
                    {r.category}
                    {r.at ? ` · ${relativeLabel(r.at)}` : ''}
                  </div>
                </div>
                <div className="chev" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
