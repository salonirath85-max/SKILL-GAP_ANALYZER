export interface Alternative {
  option: string;
  rejected: boolean;
  reason?: string;
  pros?: string[];
  cons?: string[];
}

export interface Intent {
  primary: string;
  secondary?: string[];
  timeHorizon?: string;
}

export interface Constraints {
  time?: string;
  financial?: string;
  emotional?: string;
  riskTolerance?: 'low' | 'medium' | 'high';
  other?: string[];
}

export type MoodType = 'confident' | 'uncertain' | 'anxious' | 'excited' | 'neutral' | 'hopeful' | 'stressed' | 'calm';

export interface Decision {
  id: string;
  title: string;
  description?: string;
  domain: 'career' | 'financial' | 'personal' | 'health' | 'relationships' | 'other';
  intent: Intent;
  constraints: Constraints;
  alternatives: Alternative[];
  reasoning: string[];
  finalChoice: string;
  confidence: number;
  mood?: MoodType;
  visibility: 'private' | 'selective' | 'shared';
  reflection?: string;
  outcome?: string;
  createdAt: string;
  lastRecalledAt?: string;
  linkedDecisions?: string[];
}

export interface AIReflectionRequest {
  question: string;
  decisionIds?: string[];
}

export interface AIReflectionResponse {
  relevantDecisions: Decision[];
  explanation: string;
  pastContext: string;
  currentContext?: string;
  reflectiveQuestion: string;
}

export type DecisionDomain = Decision['domain'];
export type RiskTolerance = NonNullable<Constraints['riskTolerance']>;
export type Visibility = Decision['visibility'];
