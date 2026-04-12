'use client';

import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <>
      <div
        className={`overlay${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`bsheet${open ? ' open' : ''}`}>
        <div className="bs-handle"></div>
        <div className="bs-title">{title}</div>
        {children}
      </div>
    </>
  );
}
