import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '32px 20px',
        background: 'var(--n-surface)',
        border: '1px solid var(--n-border)',
        borderRadius: 10,
        margin: '0 20px',
      }}
    >
      <AlertCircle
        size={24}
        style={{ color: 'var(--n-red-tx)', flexShrink: 0 }}
      />
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--n-ink-45)',
          letterSpacing: '-0.1px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4,
            padding: '6px 14px',
            borderRadius: 6,
            background: 'var(--n-surface)',
            border: '1px solid var(--n-border)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--n-ink-45)',
            cursor: 'pointer',
            letterSpacing: '-0.1px',
            transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-hover)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-border-2)' ;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--n-surface)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-border)';
          }}
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
