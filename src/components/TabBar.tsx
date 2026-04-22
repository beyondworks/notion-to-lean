'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, Inbox, User } from 'lucide-react';
import { useState } from 'react';
import EventSheet from './n/EventSheet';

const TABS = [
  { href: '/', label: '홈', Icon: Home, match: (p: string) => p === '/' },
  { href: '/search', label: '검색', Icon: Search, match: (p: string) => p.startsWith('/search') },
  { href: '__new__', label: '새로', Icon: Plus, match: () => false },
  { href: '/inbox', label: '인박스', Icon: Inbox, match: (p: string) => p.startsWith('/inbox') },
  { href: '/settings', label: '나', Icon: User, match: (p: string) => p.startsWith('/settings') || p.startsWith('/finance') },
] as const;

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="tabbar glass">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname || '/');
          if (href === '__new__') {
            return (
              <button
                key={href}
                type="button"
                className="tab-item"
                onClick={() => setSheetOpen(true)}
                aria-label="새로 만들기"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          }
          return (
            <Link key={href} href={href} className={`tab-item${active ? ' on' : ''}`}>
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <EventSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={() => {
          setSheetOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
