import { LayoutDashboard } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'var(--app-vh)',
        background: 'var(--n-canvas)',
        gap: '10px',
      }}
    >
      <LayoutDashboard
        size={40}
        style={{
          color: 'var(--n-ink-45)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      />
      <p
        style={{
          fontSize: '13px',
          color: 'var(--n-ink-45)',
          margin: 0,
          letterSpacing: '-0.1px',
        }}
      >
        불러오는 중...
      </p>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
