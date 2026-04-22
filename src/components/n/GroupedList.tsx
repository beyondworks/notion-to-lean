'use client';

import type { ReactNode, CSSProperties } from 'react';

export function GroupHeader({ children }: { children: ReactNode }) {
  return <div className="g-header">{children}</div>;
}

export function GroupList({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="g-list" style={style}>
      {children}
    </div>
  );
}

interface GroupRowProps {
  icon?: ReactNode;
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  disclosure?: boolean;
  style?: CSSProperties;
  withIcon?: boolean;
  children?: ReactNode;
}

export function GroupRow({
  icon,
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  disclosure,
  style,
  withIcon,
  children,
}: GroupRowProps) {
  const classes = `g-row${withIcon || icon ? ' g-row--with-icon' : ''}`;
  return (
    <div
      className={classes}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {icon && <div className="icon-tile icon-tile--lg">{icon}</div>}
      {leading}
      {(title || subtitle) && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && <div className="t-headline">{title}</div>}
          {subtitle && <div className="t-footnote">{subtitle}</div>}
        </div>
      )}
      {children}
      {trailing}
      {disclosure && <div className="chev" />}
    </div>
  );
}
