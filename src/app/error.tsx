'use client';

import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        background: 'var(--n-canvas)',
        gap: '12px',
      }}
    >
      <AlertCircle
        size={48}
        style={{ color: 'var(--n-red-tx)', flexShrink: 0 }}
      />
      <p
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--n-ink)',
          letterSpacing: '-0.3px',
          margin: 0,
        }}
      >
        문제가 발생했습니다
      </p>
      {error.message && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--n-ink-45)',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '280px',
          }}
        >
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        style={{
          marginTop: '8px',
          width: '100%',
          maxWidth: '280px',
          height: '44px',
          background: 'var(--n-ink)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '-0.1px',
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
