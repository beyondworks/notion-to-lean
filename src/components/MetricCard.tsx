import type { ReactNode } from 'react';

interface MetricCardProps {
  accent: string;
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  unit: string;
  valueColor?: string;
  sub: ReactNode;
}

export default function MetricCard({
  accent,
  icon,
  iconColor,
  label,
  value,
  unit,
  valueColor,
  sub,
}: MetricCardProps) {
  return (
    <div className="metric-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div>
        <div className={`mc-icon ${iconColor}`}>{icon}</div>
        <div className="mc-label">{label}</div>
        <div className={`mc-value${valueColor ? ` ${valueColor}` : ''}`}>
          {value}
          <span className="unit">{unit}</span>
        </div>
      </div>
      <div className="mc-sub">{sub}</div>
    </div>
  );
}
