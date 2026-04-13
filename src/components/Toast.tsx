'use client';
import { useState, useEffect, useCallback } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 2500);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
        left: '50%',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 500,

        background: 'var(--n-ink)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '-0.1px',
        padding: '8px 18px',
        borderRadius: 9999,
        boxShadow: '0 4px 16px rgba(15,15,15,0.18)',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  );
}

interface UseToastReturn {
  toast: React.ReactElement;
  showToast: (message: string) => void;
}

export function useToast(): UseToastReturn {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const onHide = useCallback(() => setVisible(false), []);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const toast = (
    <Toast message={message} visible={visible} onHide={onHide} />
  );

  return { toast, showToast };
}
