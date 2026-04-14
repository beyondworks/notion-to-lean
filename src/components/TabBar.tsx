'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, User } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/tasks', label: 'Widgets', Icon: LayoutGrid },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/finance', label: 'Profile', Icon: User },
] as const;

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
