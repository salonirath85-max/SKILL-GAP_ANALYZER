import { format } from 'date-fns';
import { ArrowLeft, Clock, Eye, Lock, Users, Check, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { DomainBadge } from './DomainBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDecisionStore } from '@/store/decisionStore';
import { cn } from '@/lib/utils';

interface DecisionDetailProps {
  decision: Decision;
}

const visibilityLabels = {
  private: { icon: Lock, label: 'Private - Only you can see this' },
  selective: { icon: Users, label: 'Selective - Shared with chosen people' },
  shared: { icon: Eye, label: 'Shared - Visible to all' },
};

const riskColors = {
  low: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-rose-600 bg-rose-50',
};

export function DecisionDetail({ decision }: DecisionDetailProps) {
  const navigate = useNavigate();
  const deleteDecision = useDecisionStore((state) => state.deleteDecision);
  const { icon: VisibilityIcon, label: visibilityLabel } = visibilityLabels[decision.visibility];

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Timeline
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <DomainBadge domain={decision.domain} />
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <VisibilityIcon className="h-4 w-4" />
              {visibilityLabel}
            </span>
          </div>
          
          <h1 className="font-serif text-3xl font-medium leading-tight md:text-4xl">
            {decision.title}
          </h1>
          
          {decision.description && (
            <p className="text-lg text-muted-foreground">
              {decision.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(decision.createdAt), 'MMMM d, yyyy')}
            </span>
            {decision.lastRecalledAt && (
              <span>
                Last recalled: {format(new Date(decision.lastRecalledAt), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Final Choice */}
        <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Final Decision
          </h2>
          <p className="font-serif text-2xl font-medium text-foreground">
            {decision.finalChoice}
          </p>
          <div className="mt-4">
            <ConfidenceIndicator confidence={decision.confidence} size="lg" />
          </div>
        </div>

        {/* Intent */}
        <section className="memory-card">
          <h2 className="mb-4 font-serif text-xl font-medium">Intent</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Primary Goal</span>
              <p className="mt-1 text-foreground">{decision.intent.primary}</p>
            </div>
            {decision.intent.secondary && decision.intent.secondary.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Secondary Goals</span>
                <ul className="mt-1 list-inside list-disc text-foreground">
                  {decision.intent.secondary.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            {decision.intent.timeHorizon && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Time Horizon</span>
                <p className="mt-1 text-foreground">{decision.intent.timeHorizon}</p>
              </div>
            )}
          </div>
        </section>

        {/* Constraints at Decision Time */}
        <section className="memory-card">
          <h2 className="mb-4 font-serif text-xl font-medium">
            Constraints at Decision Time
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {decision.constraints.time && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <span className="text-sm font-medium text-muted-foreground">Time</span>
                <p className="mt-1 text-foreground">{decision.constraints.time}</p>
              </div>
            )}
            {decision.constraints.financial && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <span className="text-sm font-medium text-muted-foreground">Financial</span>
                <p className="mt-1 text-foreground">{decision.constraints.financial}</p>
              </div>
            )}
            {decision.constraints.emotional && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <span className="text-sm font-medium text-muted-foreground">Emotional State</span>
                <p className="mt-1 text-foreground">{decision.constraints.emotional}</p>
              </div>
            )}
            {decision.constraints.riskTolerance && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <span className="text-sm font-medium text-muted-foreground">Risk Tolerance</span>
                <p className={cn(
                  "mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium capitalize",
                  riskColors[decision.constraints.riskTolerance]
                )}>
                  {decision.constraints.riskTolerance}
                </p>
              </div>
            )}
          </div>
          {decision.constraints.other && decision.constraints.other.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-muted-foreground">Other Constraints</span>
              <ul className="mt-2 space-y-1">
                {decision.constraints.other.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Alternatives Considered */}
        <section className="memory-card">
          <h2 className="mb-4 font-serif text-xl font-medium">Alternatives Considered</h2>
          <div className="space-y-4">
            {decision.alternatives.map((alt, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  alt.rejected
                    ? "border-border bg-background"
                    : "border-accent/50 bg-accent/5"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{alt.option}</h3>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                      alt.rejected
                        ? "bg-secondary text-muted-foreground"
                        : "bg-accent/20 text-accent-foreground"
                    )}
                  >
                    {alt.rejected ? (
                      <>
                        <X className="h-3 w-3" /> Rejected
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" /> Chosen
                      </>
                    )}
                  </span>
                </div>
                
                {alt.reason && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    <span className="font-medium">Reason: </span>
                    {alt.reason}
                  </p>
                )}
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {alt.pros && alt.pros.length > 0 && (
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                        Pros
                      </span>
                      <ul className="mt-1 space-y-1">
                        {alt.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {alt.cons && alt.cons.length > 0 && (
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-rose-600">
                        Cons
                      </span>
                      <ul className="mt-1 space-y-1">
                        {alt.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <X className="mt-0.5 h-3 w-3 flex-shrink-0 text-rose-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reasoning Path */}
        <section className="memory-card">
          <h2 className="mb-4 font-serif text-xl font-medium">Reasoning Path</h2>
          <ol className="space-y-3">
            {decision.reasoning.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Reflection & Outcome */}
        {(decision.reflection || decision.outcome) && (
          <section className="memory-card border-l-4 border-accent">
            <h2 className="mb-4 font-serif text-xl font-medium">Reflection</h2>
            {decision.reflection && (
              <div className="mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Personal Reflection
                </span>
                <p className="mt-1 italic text-foreground">"{decision.reflection}"</p>
              </div>
            )}
            {decision.outcome && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Outcome</span>
                <p className="mt-1 text-foreground">{decision.outcome}</p>
              </div>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <Button asChild>
            <Link to={`/reflect?decisionId=${decision.id}`}>Ask AI About This Decision</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to={`/decision/${decision.id}/edit`}>Edit Decision</Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this decision?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove it from your timeline. You can’t undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    deleteDecision(decision.id);
                    navigate('/');
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
