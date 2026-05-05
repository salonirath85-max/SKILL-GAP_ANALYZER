import * as React from 'react';
import { cn } from '@/lib/utils';
import { Decision } from '@/types/decision';
import { getDomainIcon } from '@/data/sampleDecisions';

interface DomainBadgeProps {
  domain: Decision['domain'];
  size?: 'sm' | 'md';
}

const domainStyles: Record<Decision['domain'], string> = {
  career: 'bg-blue-50 text-blue-700 border-blue-200',
  financial: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  personal: 'bg-violet-50 text-violet-700 border-violet-200',
  health: 'bg-rose-50 text-rose-700 border-rose-200',
  relationships: 'bg-amber-50 text-amber-700 border-amber-200',
  other: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const DomainBadge = React.forwardRef<HTMLSpanElement, DomainBadgeProps>(
  ({ domain, size = 'md' }, ref) => {
    const icon = getDomainIcon(domain);

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium capitalize',
          domainStyles[domain],
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        )}
      >
        <span>{icon}</span>
        {domain}
      </span>
    );
  }
);
DomainBadge.displayName = 'DomainBadge';

