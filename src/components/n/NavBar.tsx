'use client';

import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface NavBarProps {
  title: string;
  subtitle?: string;
  large?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}

export function NavBar({ title, subtitle, large = true, left, right }: NavBarProps) {
  return (
    <div className="navbar">
      <div className="navbar-row">
        <div className="navbar-actions">{left}</div>
        {!large && <div className="navbar-title-compact">{title}</div>}
        <div className="navbar-actions">{right}</div>
      </div>
      {large && (
        <div className="navbar-large">
          {subtitle && <div className="t-footnote" style={{ marginBottom: 2 }}>{subtitle}</div>}
          <div className="t-large-title">{title}</div>
        </div>
      )}
    </div>
  );
}

interface NavIconBtnProps {
  icon: ReactNode;
  onClick?: () => void;
  badge?: boolean;
  ariaLabel?: string;
}

export function NavIconBtn({ icon, onClick, badge, ariaLabel }: NavIconBtnProps) {
  return (
    <button className="nav-icon-btn" onClick={onClick} aria-label={ariaLabel}>
      {icon}
      {badge && <span className="badge" />}
    </button>
  );
}

export function BackBtn({ onClick, ariaLabel = '뒤로' }: { onClick?: () => void; ariaLabel?: string }) {
  return <NavIconBtn icon={<ChevronLeft />} onClick={onClick} ariaLabel={ariaLabel} />;
}
