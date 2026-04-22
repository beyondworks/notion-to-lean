'use client';

interface ToggleProps {
  on: boolean;
  onChange?: (next: boolean) => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => onChange?.(!on)}
      aria-pressed={on}
    >
      <span className="toggle-thumb" />
    </button>
  );
}
