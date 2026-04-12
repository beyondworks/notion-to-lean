import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeadProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  moreLabel: string;
  moreHref?: string;
}

export default function SectionHead({ icon, title, moreLabel }: SectionHeadProps) {
  return (
    <div className="w-section-head">
      <div className="w-section-title">
        {icon} {title}
      </div>
      <div className="w-section-more">
        <span>{moreLabel}</span>
        <ChevronRight size={10} />
      </div>
    </div>
  );
}
