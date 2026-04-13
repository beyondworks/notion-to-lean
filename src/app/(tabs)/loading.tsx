export default function TabsLoading() {
  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 0 4px' }}>
        <div style={skeletonStyle({ width: '40%', height: '14px', borderRadius: '4px' })} />
        <div style={skeletonStyle({ width: '65%', height: '28px', borderRadius: '6px' })} />
        <div style={skeletonStyle({ width: '50%', height: '12px', borderRadius: '4px' })} />
      </div>

      {/* Metric strip skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={skeletonStyle({ height: '90px', borderRadius: '10px' })}
          />
        ))}
      </div>

      {/* Section skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={skeletonStyle({ width: '30%', height: '14px', borderRadius: '4px' })} />
        <div style={skeletonStyle({ height: '60px', borderRadius: '10px' })} />
        <div style={skeletonStyle({ height: '60px', borderRadius: '10px' })} />
        <div style={skeletonStyle({ height: '60px', borderRadius: '10px' })} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.55; }
          50% { opacity: 0.85; }
          100% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

function skeletonStyle(overrides: React.CSSProperties): React.CSSProperties {
  return {
    background: 'var(--n-border)',
    animation: 'shimmer 1.4s ease-in-out infinite',
    width: '100%',
    ...overrides,
  };
}
