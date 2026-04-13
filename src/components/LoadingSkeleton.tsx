const pulseStyle: React.CSSProperties = {
  background: 'var(--n-border)',
  borderRadius: 4,
  animation: 'pulse 1.6s ease-in-out infinite',
};

const block = (w: string | number, h: number, extra?: React.CSSProperties): React.CSSProperties => ({
  ...pulseStyle,
  width: w,
  height: h,
  ...extra,
});

function CardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--n-surface)',
        border: '1px solid var(--n-border)',
        borderRadius: 10,
        padding: 13,
        width: 228,
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Cover area */}
      <div style={{ ...pulseStyle, height: 72, borderRadius: '8px 8px 0 0', margin: '-13px -13px 0' }} />
      {/* Text lines */}
      <div style={block('80%', 11, { marginTop: 4 })} />
      <div style={block('65%', 11)} />
      <div style={block('50%', 11)} />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 13px',
            borderBottom: '1px solid var(--n-border)',
          }}
        >
          <div style={block(14, 14, { borderRadius: 3, flexShrink: 0 })} />
          <div style={block('60%', 11)} />
          <div style={{ marginLeft: 'auto', ...block(50, 11) }} />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div
      style={{
        background: 'var(--n-surface)',
        border: '1px solid var(--n-border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '8px 13px',
          background: 'rgba(55,53,47,0.02)',
          borderBottom: '1px solid var(--n-border)',
        }}
      >
        <div style={block('40%', 9)} />
        <div style={block('25%', 9)} />
        <div style={block('20%', 9)} />
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            padding: '11px 13px',
            borderBottom: i < 4 ? '1px solid var(--n-border)' : undefined,
            alignItems: 'center',
          }}
        >
          <div style={block('40%', 11)} />
          <div style={block('25%', 11)} />
          <div style={block('20%', 11)} />
        </div>
      ))}
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '0 20px' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--n-surface)',
            border: '1px solid var(--n-border)',
            borderRadius: 10,
            padding: '12px 12px 11px',
            minHeight: 90,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={block('55%', 9)} />
          <div style={block('70%', 20, { borderRadius: 4 })} />
          <div style={block('45%', 9)} />
        </div>
      ))}
    </div>
  );
}

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'table' | 'metric';
}

export default function LoadingSkeleton({ variant }: LoadingSkeletonProps) {
  if (variant === 'card') return <CardSkeleton />;
  if (variant === 'list') return <ListSkeleton />;
  if (variant === 'table') return <TableSkeleton />;
  return <MetricSkeleton />;
}
