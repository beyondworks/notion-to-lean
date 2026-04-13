interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}

export default function EmptyState({ icon, message, sub }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--n-ink-25)',
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--n-ink-60)',
          letterSpacing: '-0.15px',
          lineHeight: 1.4,
        }}
      >
        {message}
      </p>
      {sub && (
        <p
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: 'var(--n-ink-45)',
            letterSpacing: '-0.05px',
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
