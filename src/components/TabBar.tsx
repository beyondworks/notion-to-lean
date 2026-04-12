'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CheckSquare, Wallet } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/tasks', label: 'Tasks', Icon: CheckSquare },
  { href: '/finance', label: 'Finance', Icon: Wallet },
] as const;

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {TABS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={`tab-i${isActive ? ' on' : ''}`}>
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
