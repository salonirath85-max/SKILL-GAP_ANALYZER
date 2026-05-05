import { format } from 'date-fns';
import { ChevronRight, Clock, Eye, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { DomainBadge } from './DomainBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { cn } from '@/lib/utils';

interface DecisionCardProps {
  decision: Decision;
  showTimeline?: boolean;
}

const visibilityIcons = {
  private: Lock,
  selective: Users,
  shared: Eye,
};

export function DecisionCard({ decision, showTimeline = false }: DecisionCardProps) {
  const VisibilityIcon = visibilityIcons[decision.visibility];
  
  return (
    <div className="group relative flex gap-4">
      {showTimeline && (
        <div className="flex flex-col items-center">
          <div className="timeline-dot z-10 mt-6" />
          <div className="h-full w-px bg-timeline-line" />
        </div>
      )}
      
      <Link
        to={`/decision/${decision.id}`}
        className={cn(
          "memory-card flex-1 cursor-pointer",
          "hover:border-accent/50"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DomainBadge domain={decision.domain} size="sm" />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <VisibilityIcon className="h-3 w-3" />
                {decision.visibility}
              </span>
            </div>
            <h3 className="font-serif text-xl font-medium leading-tight text-foreground transition-colors group-hover:text-accent">
              {decision.title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
        </div>
        
        {decision.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {decision.description}
          </p>
        )}
        
        <div className="mb-4 rounded-lg bg-secondary/50 p-3">
          <p className="text-sm font-medium text-foreground">
            → {decision.finalChoice}
          </p>
        </div>
        
        <div className="mb-4">
          <ConfidenceIndicator confidence={decision.confidence} size="sm" />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(decision.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {decision.lastRecalledAt && (
            <span>
              Last recalled: {format(new Date(decision.lastRecalledAt), 'MMM d')}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
