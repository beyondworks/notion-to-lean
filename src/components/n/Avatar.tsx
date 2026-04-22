'use client';

const AVATAR_COLORS = ['#E69C6E', '#8FA37E', '#6A8CAB', '#B57CAE', '#A8925A'];

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 24, color }: AvatarProps) {
  const bg = color || AVATAR_COLORS[(name || 'A').charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: bg,
        color: '#fff',
        fontSize: Math.round(size * 0.42),
        borderColor: 'transparent',
      }}
    >
      {(name || '?').slice(0, 1).toUpperCase()}
    </div>
  );
}

interface AssigneesProps {
  names: string[];
  size?: number;
}

export function Assignees({ names, size = 22 }: AssigneesProps) {
  return (
    <div style={{ display: 'flex' }}>
      {names.slice(0, 3).map((n, i) => (
        <div key={`${n}-${i}`} style={{ marginLeft: i === 0 ? 0 : -7 }}>
          <Avatar name={n} size={size} />
        </div>
      ))}
      {names.length > 3 && (
        <div
          className="avatar"
          style={{ width: size, height: size, marginLeft: -7, fontSize: 10 }}
        >
          +{names.length - 3}
        </div>
      )}
    </div>
  );
}
