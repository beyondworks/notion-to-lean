'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { useNotionData } from '@/lib/hooks';
import type { Task } from '@/lib/types';
import { NavBar, NavIconBtn, BackBtn } from '@/components/n/NavBar';
import TabBar from '@/components/TabBar';

interface CalEvent {
  id: string;
  title: string;
  color: string;
  time: string;
}

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function tagColorFor(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('design') || lower.includes('디자인')) return 'blue';
  if (lower.includes('dev') || lower.includes('api')) return 'purple';
  if (lower.includes('research') || lower.includes('리서치')) return 'green';
  if (lower.includes('meeting') || lower.includes('미팅')) return 'brown';
  if (lower.includes('copy')) return 'yellow';
  if (lower.includes('urgent') || lower.includes('긴급')) return 'red';
  if (lower.includes('release') || lower.includes('릴리스')) return 'red';
  return 'gray';
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  if (h === '00' && m === '00') return '종일';
  return `${h}:${m}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: tasks } = useNotionData<Task[]>('tasks');
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const taskList = tasks ?? [];

  // Events grouped by day-of-month (for current view month only)
  const events = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    taskList.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return;
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push({
        id: t.id,
        title: t.title,
        color: tagColorFor(t.category),
        time: formatTime(t.dueDate),
      });
    });
    return map;
  }, [taskList, viewYear, viewMonth]);

  // Build calendar cells (leading blanks + days + trailing blanks to fill week)
  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewYear, viewMonth]);

  const selectedEvents = events[selectedDay] || [];
  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--n-bg-grouped)' }}>
      <NavBar
        title={`${viewYear}년 ${MONTH_NAMES_KO[viewMonth]}`}
        large={false}
        left={<BackBtn onClick={() => router.push('/')} />}
        right={
          <>
            <NavIconBtn icon={<Search />} onClick={() => router.push('/search')} />
            <NavIconBtn icon={<Plus />} />
          </>
        }
      />

      {/* Weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 10px 6px' }}>
        {WEEK_LABELS.map((d, i) => (
          <div
            key={d}
            className="t-caption"
            style={{ textAlign: 'center', padding: '6px 0', color: i === 0 ? '#D44C47' : 'var(--n-text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px', rowGap: 2 }}>
        {cells.map((d, i) => {
          const isSun = i % 7 === 0;
          const ev = d ? events[d] : null;
          const isSel = d === selectedDay;
          return (
            <div
              key={i}
              onClick={() => d && setSelectedDay(d)}
              style={{
                aspectRatio: '1 / 1.15',
                padding: 3,
                cursor: d ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  display: 'grid',
                  placeItems: 'center',
                  background: isSel ? 'var(--n-accent)' : 'transparent',
                  color: isSel ? 'var(--n-bg)' : isSun ? '#D44C47' : 'var(--n-text)',
                  fontWeight: d && isToday(d) && !isSel ? 700 : 500,
                  fontSize: 15,
                }}
                className="num"
              >
                {d || ''}
              </div>
              {ev && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center' }}>
                  {ev.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev2) => {
                        ev2.stopPropagation();
                        setSelectedDay(d!);
                        router.push(`/edit/${e.id}`);
                      }}
                      style={{
                        width: 'calc(100% - 6px)',
                        background: `var(--n-tag-${e.color}-bg)`,
                        color: `var(--n-tag-${e.color}-fg)`,
                        fontSize: 9,
                        lineHeight: 1.3,
                        padding: '1px 4px',
                        borderRadius: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {ev.length > 2 && (
                    <div
                      onClick={(ev2) => {
                        ev2.stopPropagation();
                        setSelectedDay(d!);
                      }}
                      style={{ fontSize: 9, color: 'var(--n-text-muted)', cursor: 'pointer' }}
                    >
                      +{ev.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agenda for selected date */}
      <div className="g-header" style={{ marginTop: 14 }}>
        {MONTH_NAMES_KO[viewMonth]} {selectedDay}일 · {selectedEvents.length}개 일정
      </div>
      <div className="g-list">
        {selectedEvents.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--n-text-muted)' }} className="t-footnote">
            일정이 없어요.
          </div>
        ) : (
          selectedEvents.map((e) => (
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
                  background: `var(--n-tag-${e.color}-fg)`,
                  margin: '2px 4px 2px 0',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-headline">{e.title}</div>
                <div className="t-footnote">{e.time}</div>
              </div>
              <div className="chev" />
            </div>
          ))
        )}
      </div>

      <TabBar />
    </div>
  );
}
