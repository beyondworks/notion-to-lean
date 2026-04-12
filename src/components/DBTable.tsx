import type { ReactNode } from 'react';

interface Column {
  key: string;
  icon: ReactNode;
  label: string;
  width?: number;
  className: string;
}

interface Row {
  key: string;
  cells: ReactNode[];
  className?: string;
}

interface DBTableProps {
  columns: Column[];
  rows: Row[];
  variant?: 'default' | 'finance';
}

export default function DBTable({ columns, rows }: DBTableProps) {
  return (
    <div className="db-card">
      <div className="db-head">
        {columns.map((col) => (
          <div
            key={col.key}
            className={col.className}
            style={col.width ? { width: col.width } : undefined}
          >
            <span>
              {col.icon} {col.label}
            </span>
          </div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.key} className={`db-row${row.className ? ` ${row.className}` : ''}`}>
          {row.cells}
        </div>
      ))}
    </div>
  );
}
