'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  LayoutGrid,
  Inbox,
  Folder,
  Briefcase,
  FileText,
  ClipboardList,
  BookOpen,
  NotebookPen,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  CalendarDays,
  Clock3,
  Timer,
  User,
  Users,
  Heart,
  Box,
  Package,
  Bookmark,
  Tag,
  Flag,
  Sun,
  Moon,
  Star,
  Sparkles,
  Leaf,
  Zap,
  Compass,
  MapPin,
  Target,
  Rocket,
  Lightbulb,
  Plus,
  Pencil,
  Shuffle,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { useEditMode } from './EditModeContext';

type IconEntry = { name: string; Icon: LucideIcon };

const ICON_POOL: IconEntry[] = [
  { name: 'layout-dashboard', Icon: LayoutDashboard },
  { name: 'home', Icon: Home },
  { name: 'layout-grid', Icon: LayoutGrid },
  { name: 'inbox', Icon: Inbox },
  { name: 'folder', Icon: Folder },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'file-text', Icon: FileText },
  { name: 'clipboard-list', Icon: ClipboardList },
  { name: 'book-open', Icon: BookOpen },
  { name: 'notebook-pen', Icon: NotebookPen },
  { name: 'bell', Icon: Bell },
  { name: 'mail', Icon: Mail },
  { name: 'message-square', Icon: MessageSquare },
  { name: 'calendar', Icon: Calendar },
  { name: 'calendar-days', Icon: CalendarDays },
  { name: 'clock-3', Icon: Clock3 },
  { name: 'timer', Icon: Timer },
  { name: 'user', Icon: User },
  { name: 'users', Icon: Users },
  { name: 'heart', Icon: Heart },
  { name: 'box', Icon: Box },
  { name: 'package', Icon: Package },
  { name: 'bookmark', Icon: Bookmark },
  { name: 'tag', Icon: Tag },
  { name: 'flag', Icon: Flag },
  { name: 'sun', Icon: Sun },
  { name: 'moon', Icon: Moon },
  { name: 'star', Icon: Star },
  { name: 'sparkles', Icon: Sparkles },
  { name: 'leaf', Icon: Leaf },
  { name: 'zap', Icon: Zap },
  { name: 'compass', Icon: Compass },
  { name: 'map-pin', Icon: MapPin },
  { name: 'target', Icon: Target },
  { name: 'rocket', Icon: Rocket },
  { name: 'lightbulb', Icon: Lightbulb },
];

export default function Header() {
  const { isEditing, toggleEdit } = useEditMode();
  const [currentIcon, setCurrentIcon] = useState<string | null>('layout-dashboard');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const currentIconEntry = currentIcon
    ? ICON_POOL.find((e) => e.name === currentIcon) ?? null
    : null;

  function pickIcon(name: string) {
    setCurrentIcon(name);
    setIconPickerOpen(false);
  }

  function removeIcon() {
    setCurrentIcon(null);
    setIconPickerOpen(false);
  }

  function randomIcon() {
    const pool = ICON_POOL.filter((e) => e.name !== currentIcon);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) pickIcon(pick.name);
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr-crumb">
          <Box size={9} />
          <span>Beyondworks</span>
          <span className="sep">/</span>
          <span>대시보드</span>
        </div>
        <div className="hdr-topline">
          <div>
            {currentIconEntry ? (
              <button
                className="page-icon"
                onClick={() => setIconPickerOpen(true)}
                aria-label="페이지 아이콘 변경"
              >
                <currentIconEntry.Icon size={19} />
              </button>
            ) : (
              <button
                className="page-icon empty"
                onClick={() => setIconPickerOpen(true)}
                aria-label="페이지 아이콘 변경"
              >
                <Plus size={10} />
                <span>아이콘 추가</span>
              </button>
            )}
            <div className="hdr-hero">Good Friday</div>
            <div className="hdr-sub">
              <span>2026. 4. 11.</span>
              <span className="dot"></span>
              <span>금요일</span>
              <span className="dot"></span>
              <span>남은 일정 12</span>
            </div>
          </div>
          <div className="hdr-actions">
            <button
              className={`hdr-btn${isEditing ? ' active' : ''}`}
              onClick={toggleEdit}
              aria-label="편집"
            >
              <Pencil size={14} />
            </button>
            <button className="hdr-btn" aria-label="알림">
              <Bell size={14} />
            </button>
          </div>
        </div>
      </header>

      <BottomSheet
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        title="페이지 아이콘"
      >
        <div className="icon-actions">
          <button className="icon-action" onClick={randomIcon}>
            <Shuffle size={10} /> 랜덤
          </button>
          <button className="icon-action danger" onClick={removeIcon}>
            <Trash2 size={10} /> 제거
          </button>
        </div>
        <div className="icon-grid">
          {ICON_POOL.map(({ name, Icon }) => (
            <button
              key={name}
              className={`icon-cell${currentIcon === name ? ' selected' : ''}`}
              onClick={() => pickIcon(name)}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
