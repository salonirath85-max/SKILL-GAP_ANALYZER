import * as React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceIndicator = React.forwardRef<HTMLDivElement, ConfidenceIndicatorProps>(
  ({ confidence, showLabel = true, size = 'md' }, ref) => {
    const percentage = Math.round(confidence * 100);

    const getConfidenceLevel = () => {
      if (confidence >= 0.7) return { label: 'High', color: 'bg-confidence-high' };
      if (confidence >= 0.4) return { label: 'Medium', color: 'bg-confidence-medium' };
      return { label: 'Low', color: 'bg-confidence-low' };
    };

    const { label, color } = getConfidenceLevel();

    const heights = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    return (
      <div ref={ref} className="space-y-1">
        {showLabel && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">
              {percentage}% · {label}
            </span>
          </div>
        )}
        <div className={cn('w-full rounded-full bg-secondary', heights[size])}>
          <div
            className={cn('rounded-full transition-all duration-700', color, heights[size])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
ConfidenceIndicator.displayName = 'ConfidenceIndicator';

