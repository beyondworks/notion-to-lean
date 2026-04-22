'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Clock, MapPin, Users, Bell, Tag as TagIcon, AlignLeft } from 'lucide-react';
import { Toggle } from './Toggle';
import { Assignees } from './Avatar';
import { GroupList } from './GroupedList';
import { useMutation } from '@/lib/hooks';
import { DB_IDS_CLIENT } from '@/lib/db-ids';

interface EventSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (title: string) => void;
}

const SUGGESTIONS = [
  '내일 10시 디자인 리뷰',
  '금요일 오후 2시 고객 미팅',
  '다음주 월요일 스탠드업',
];

export default function EventSheet({ open, onClose, onCreated }: EventSheetProps) {
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const { mutate, loading } = useMutation<{ dbId: string; title: string }>('pages', 'POST');

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) setTitle('');
  }, [open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    const result = await mutate({ dbId: DB_IDS_CLIENT.TASKS, title: title.trim() });
    if (result) {
      onCreated?.(title.trim());
      onClose();
    }
  };

  return (
    <>
      <div
        className={`sheet-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div className={`sheet${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="sheet-grabber"><span /></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 8px' }}>
          <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ padding: '6px 4px' }}>취소</button>
          <div className="t-headline">새 일정</div>
          <button
            className="btn btn--sm btn--primary"
            onClick={handleSave}
            disabled={!title.trim() || loading}
            style={{ padding: '6px 14px' }}
          >
            {loading ? '저장중' : '저장'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {/* Quick capture */}
          <div style={{ padding: '8px 20px 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--n-surface)', borderRadius: 14, padding: 14,
              boxShadow: 'var(--sh-1)',
            }}>
              <Sparkles size={18} color="var(--n-tag-purple-fg)" />
              <input
                autoFocus={open}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="내일 10시 디자인 리뷰..."
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 17, color: 'var(--n-text)', font: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10 }} className="hide-scroll">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTitle(s)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', border: 'none',
                    background: 'var(--n-surface)', borderRadius: 16, fontSize: 13,
                    cursor: 'pointer', color: 'var(--n-text-muted)',
                    boxShadow: 'var(--sh-1)', whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <GroupList>
            <div className="g-row">
              <Clock size={18} color="var(--n-text-muted)" />
              <div style={{ flex: 1 }} className="t-body">하루 종일</div>
              <Toggle on={allDay} onChange={setAllDay} />
            </div>
            <div className="g-row">
              <div style={{ width: 18 }} />
              <div style={{ flex: 1 }} className="t-body">시작</div>
              <div className="t-body muted">오늘</div>
            </div>
            <div className="g-row">
              <div style={{ width: 18 }} />
              <div style={{ flex: 1 }} className="t-body">종료</div>
              <div className="t-body muted">+1시간</div>
            </div>
          </GroupList>

          <div style={{ marginTop: 16 }}>
            <GroupList>
              <div className="g-row">
                <MapPin size={18} color="var(--n-text-muted)" />
                <div style={{ flex: 1 }} className="t-body">장소 추가</div>
              </div>
              <div className="g-row">
                <Users size={18} color="var(--n-text-muted)" />
                <div style={{ flex: 1 }} className="t-body">참여자</div>
                <Assignees names={['H', 'K', 'J']} size={22} />
              </div>
              <div className="g-row">
                <Bell size={18} color="var(--n-text-muted)" />
                <div style={{ flex: 1 }} className="t-body">알림</div>
                <div className="t-body muted">10분 전</div>
              </div>
              <div className="g-row">
                <TagIcon size={18} color="var(--n-text-muted)" />
                <div style={{ flex: 1 }} className="t-body">DB</div>
                <div className="t-body">태스크</div>
              </div>
            </GroupList>
          </div>

          <div style={{ marginTop: 16 }}>
            <GroupList>
              <div className="g-row" style={{ alignItems: 'flex-start', padding: '12px 16px' }}>
                <AlignLeft size={18} color="var(--n-text-muted)" style={{ marginTop: 2 }} />
                <textarea
                  placeholder="메모 및 설명..."
                  rows={3}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    resize: 'none', font: 'inherit', fontSize: 17, color: 'var(--n-text)',
                  }}
                />
              </div>
            </GroupList>
          </div>
        </div>
      </div>
    </>
  );
}
