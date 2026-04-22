'use client';

import type { ReactNode } from 'react';

export type NotionColor =
  | 'gray' | 'brown' | 'orange' | 'yellow' | 'green'
  | 'blue' | 'purple' | 'pink' | 'red' | 'default';

const COLOR_MAP: Record<NotionColor, string> = {
  default: 'tag-gray',
  gray: 'tag-gray',
  brown: 'tag-brown',
  orange: 'tag-orange',
  yellow: 'tag-yellow',
  green: 'tag-green',
  blue: 'tag-blue',
  purple: 'tag-purple',
  pink: 'tag-pink',
  red: 'tag-red',
};

export function normalizeNotionColor(input?: string | null): NotionColor {
  if (!input) return 'default';
  const lower = input.toLowerCase();
  if (lower in COLOR_MAP) return lower as NotionColor;
  if (lower.includes('gray') || lower.includes('grey')) return 'gray';
  if (lower.includes('brown')) return 'brown';
  if (lower.includes('orange')) return 'orange';
  if (lower.includes('yellow')) return 'yellow';
  if (lower.includes('green')) return 'green';
  if (lower.includes('blue') || lower.includes('teal') || lower.includes('cyan')) return 'blue';
  if (lower.includes('purple') || lower.includes('violet')) return 'purple';
  if (lower.includes('pink') || lower.includes('magenta')) return 'pink';
  if (lower.includes('red')) return 'red';
  return 'default';
}

interface TagProps {
  color?: NotionColor | string;
  children: ReactNode;
  dot?: boolean;
}

export function Tag({ color = 'default', children, dot }: TagProps) {
  const nc = typeof color === 'string' ? normalizeNotionColor(color) : color;
  return (
    <span className={`tag ${COLOR_MAP[nc]}`}>
      {dot && <span>●</span>}
      {children}
    </span>
  );
}
