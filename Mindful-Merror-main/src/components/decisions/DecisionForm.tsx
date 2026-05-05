import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, X, Save } from 'lucide-react';
import { Decision, Alternative, DecisionDomain, RiskTolerance, Visibility } from '@/types/decision';
import { useDecisionStore } from '@/store/decisionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useMongoSync } from '@/hooks/useMongoSync';

const DOMAINS: { value: DecisionDomain; label: string; icon: string }[] = [
  { value: 'career', label: 'Career', icon: '' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'personal', label: 'Personal', icon: '🌟' },
  { value: 'health', label: 'Health', icon: '❤️' },
  { value: 'relationships', label: 'Relationships', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📝' },
];

interface DecisionFormProps {
  mode?: 'create' | 'edit';
  initialDecision?: Decision;
}

export function DecisionForm({ mode = 'create', initialDecision }: DecisionFormProps) {
  const navigate = useNavigate();
  const addDecision = useDecisionStore((state) => state.addDecision);
  const updateDecision = useDecisionStore((state) => state.updateDecision);
  const { syncDecision } = useMongoSync();
  const [consent, setConsent] = useState(mode === 'edit');

  // Form state
  const [title, setTitle] = useState(initialDecision?.title ?? '');
  const [description, setDescription] = useState(initialDecision?.description ?? '');
  const [domain, setDomain] = useState<DecisionDomain>(initialDecision?.domain ?? 'career');
  const [primaryGoal, setPrimaryGoal] = useState(initialDecision?.intent.primary ?? '');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(initialDecision?.intent.secondary ?? []);
  const [newSecondaryGoal, setNewSecondaryGoal] = useState('');
  const [timeHorizon, setTimeHorizon] = useState(initialDecision?.intent.timeHorizon ?? '');
  const [timeConstraint, setTimeConstraint] = useState(initialDecision?.constraints.time ?? '');
  const [financialConstraint, setFinancialConstraint] = useState(initialDecision?.constraints.financial ?? '');
  const [emotionalState, setEmotionalState] = useState(initialDecision?.constraints.emotional ?? '');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(initialDecision?.constraints.riskTolerance ?? 'medium');
  const [alternatives, setAlternatives] = useState<Alternative[]>(initialDecision?.alternatives ?? []);
  const [newAlternative, setNewAlternative] = useState('');
  const [finalChoice, setFinalChoice] = useState(initialDecision?.finalChoice ?? '');
  const [reasoning, setReasoning] = useState<string[]>(initialDecision?.reasoning ?? []);
  const [newReasoning, setNewReasoning] = useState('');
  const [confidence, setConfidence] = useState([Math.round((initialDecision?.confidence ?? 0.7) * 100)]);
  const [visibility, setVisibility] = useState<Visibility>(initialDecision?.visibility ?? 'private');

  // Validation
  const isFormValid = useMemo(() => {
    return (
      title.trim() !== '' &&
      domain &&
      primaryGoal.trim() !== '' &&
      alternatives.length > 0 &&
      finalChoice !== '' &&
      reasoning.length > 0 &&
      consent
    );
  }, [title, domain, primaryGoal, alternatives, finalChoice, reasoning, consent]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!title.trim()) missing.push('Title');
    if (!primaryGoal.trim()) missing.push('Primary Goal');
    if (alternatives.length === 0) missing.push('At least one alternative');
    if (!finalChoice) missing.push('Final choice selection');
    if (reasoning.length === 0) missing.push('At least one reasoning step');
    if (!consent) missing.push('Consent checkbox');
    return missing;
  }, [title, primaryGoal, alternatives, finalChoice, reasoning, consent]);

  const addSecondaryGoal = () => {
    if (newSecondaryGoal.trim()) {
      setSecondaryGoals([...secondaryGoals, newSecondaryGoal.trim()]);
      setNewSecondaryGoal('');
    }
  };

  const addAlternative = () => {
    if (newAlternative.trim()) {
      setAlternatives([
        ...alternatives,
        { option: newAlternative.trim(), rejected: true, pros: [], cons: [] },
      ]);
      setNewAlternative('');
    }
  };

  const updateAlternative = (index: number, updates: Partial<Alternative>) => {
    setAlternatives(
      alternatives.map((alt, i) => (i === index ? { ...alt, ...updates } : alt))
    );
  };

  const removeAlternative = (index: number) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
    if (alternatives[index]?.option === finalChoice) {
      setFinalChoice('');
    }
  };

  const addReasoningStep = () => {
    if (newReasoning.trim()) {
      setReasoning([...reasoning, newReasoning.trim()]);
      setNewReasoning('');
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    const decision: Decision = {
      id: initialDecision?.id ?? `DEC_${Date.now()}`,
      title,
      description: description || undefined,
      domain,
      intent: {
        primary: primaryGoal,
        secondary: secondaryGoals.length > 0 ? secondaryGoals : undefined,
        timeHorizon: timeHorizon || undefined,
      },
      constraints: {
        time: timeConstraint || undefined,
        financial: financialConstraint || undefined,
        emotional: emotionalState || undefined,
        riskTolerance,
      },
      alternatives: alternatives.map((alt) => ({
        ...alt,
        rejected: alt.option !== finalChoice,
      })),
      reasoning,
      finalChoice,
      confidence: confidence[0] / 100,
      visibility,
      createdAt: initialDecision?.createdAt ?? new Date().toISOString(),
      lastRecalledAt: initialDecision?.lastRecalledAt,
      linkedDecisions: initialDecision?.linkedDecisions,
    };

    if (mode === 'edit' && initialDecision) {
      updateDecision(initialDecision.id, decision);
    } else {
      addDecision(decision);
    }

    // Sync to MongoDB
    await syncDecision(decision);

    navigate(`/decision/${decision.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-8">
      {/* Basic Info Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">Basic Information</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Decision Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Chose startup internship over full-time exam prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more context about this decision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Domain <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DOMAINS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDomain(value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all",
                    domain === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span>{icon}</span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intent Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">What You're Trying to Achieve</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryGoal">Primary Goal <span className="text-destructive">*</span></Label>
            <Input
              id="primaryGoal"
              placeholder="e.g., Skill growth through hands-on experience"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Secondary Goals</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a secondary goal..."
                value={newSecondaryGoal}
                onChange={(e) => setNewSecondaryGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryGoal())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSecondaryGoal}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {secondaryGoals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {secondaryGoals.map((goal, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                    {goal}
                    <button
                      type="button"
                      onClick={() => setSecondaryGoals(secondaryGoals.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeHorizon">Time Horizon</Label>
            <Input
              id="timeHorizon"
              placeholder="e.g., 6 months, 1 year"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Constraints Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">Constraints & Context</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeConstraint">Time Constraints</Label>
              <Input
                id="timeConstraint"
                placeholder="e.g., Limited availability"
                value={timeConstraint}
                onChange={(e) => setTimeConstraint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="financialConstraint">Financial Constraints</Label>
              <Input
                id="financialConstraint"
                placeholder="e.g., Limited budget"
                value={financialConstraint}
                onChange={(e) => setFinancialConstraint(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emotionalState">Emotional State</Label>
            <Input
              id="emotionalState"
              placeholder="e.g., Stressed, excited, uncertain"
              value={emotionalState}
              onChange={(e) => setEmotionalState(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Risk Tolerance</Label>
            <RadioGroup
              value={riskTolerance}
              onValueChange={(v) => setRiskTolerance(v as RiskTolerance)}
              className="flex gap-4"
            >
              {(['low', 'medium', 'high'] as RiskTolerance[]).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <RadioGroupItem value={level} id={`risk-${level}`} />
                  <Label htmlFor={`risk-${level}`} className="cursor-pointer capitalize">
                    {level}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Alternatives Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">Options Considered <span className="text-destructive">*</span></h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add all options you considered, then select the one you chose
        </p>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an option..."
              value={newAlternative}
              onChange={(e) => setNewAlternative(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternative())}
            />
            <Button type="button" variant="outline" onClick={addAlternative}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {alternatives.length > 0 && (
            <div className="space-y-3">
              {alternatives.map((alt, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 transition-all",
                    finalChoice === alt.option ? "border-accent bg-accent/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium flex-1">{alt.option}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={finalChoice === alt.option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFinalChoice(alt.option)}
                      >
                        {finalChoice === alt.option ? (
                          <><Check className="mr-1 h-3 w-3" /> Chosen</>
                        ) : (
                          "Select"
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeAlternative(index)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {finalChoice !== alt.option && finalChoice && (
                    <Input
                      placeholder="Why was this rejected? (optional)"
                      value={alt.reason || ''}
                      onChange={(e) => updateAlternative(index, { reason: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reasoning Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">Your Reasoning <span className="text-destructive">*</span></h2>
        <p className="text-sm text-muted-foreground mb-4">
          Explain your thought process step by step
        </p>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a reasoning step..."
              value={newReasoning}
              onChange={(e) => setNewReasoning(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReasoningStep())}
            />
            <Button type="button" variant="outline" onClick={addReasoningStep}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {reasoning.length > 0 && (
            <ol className="space-y-2">
              {reasoning.map((step, index) => (
                <li key={index} className="flex items-start gap-3 rounded-lg bg-secondary p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{step}</span>
                  <button
                    type="button"
                    onClick={() => setReasoning(reasoning.filter((_, i) => i !== index))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Confidence & Visibility */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl font-medium">Confidence & Privacy</h2>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Confidence Level: {confidence[0]}%</Label>
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How confident are you in this decision right now?
            </p>
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(v) => setVisibility(v as Visibility)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="visibility-private" />
                <Label htmlFor="visibility-private" className="cursor-pointer">Private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shared" id="visibility-shared" />
                <Label htmlFor="visibility-shared" className="cursor-pointer">Shared</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Submit Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              I understand this decision will be saved to help my future self understand my reasoning. 
              I can edit or delete it at any time.
            </Label>
          </div>

          {!isFormValid && missingFields.length > 0 && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Complete these to save:</p>
              <ul className="list-disc list-inside">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {mode === 'edit' ? 'Update Decision' : 'Save Decision'}
          </Button>
        </div>
      </section>
    </div>
  );
}
