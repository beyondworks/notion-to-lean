import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeadProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  moreLabel: string;
  href?: string;
  onMore?: () => void;
}

export default function SectionHead({ icon, title, moreLabel, href, onMore }: SectionHeadProps) {
  const more = (
    <div className="w-section-more">
      <span>{moreLabel}</span>
      <ChevronRight size={10} />
    </div>
  );

  return (
    <div className="w-section-head">
      <div className="w-section-title">
        {icon} {title}
      </div>
      {onMore ? (
        <button onClick={onMore} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }}>
          {more}
        </button>
      ) : href ? (
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{more}</Link>
      ) : (
        more
      )}
    </div>
  );
}
