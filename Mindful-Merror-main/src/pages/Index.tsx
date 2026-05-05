import { Link } from 'react-router-dom';
import { Brain, Plus, Shield, Eye, Database } from 'lucide-react';
import { useDecisionStore } from '@/store/decisionStore';
import { Layout } from '@/components/layout/Layout';
import { DecisionTimeline } from '@/components/decisions/DecisionTimeline';
import { Button } from '@/components/ui/button';

const Index = () => {
  const decisions = useDecisionStore((state) => state.decisions);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="mx-auto max-w-2xl animate-fade-in">
          <h1 className="font-serif text-4xl font-medium leading-tight text-white md:text-5xl">
            Your Decisions,{' '}
            <span className="text-accent">Preserved</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/add">
                <Plus className="mr-2 h-5 w-5" />
                Record New Decision
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/reflect">
                <Brain className="mr-2 h-5 w-5" />
                Ask AI
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all hover:bg-white/15">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-medium text-white">Structured Memory</h3>
            <p className="mt-2 text-sm text-white/70">
              Store intent, constraints, alternatives, and reasoning for every important decision.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all hover:bg-white/15">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Eye className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-serif text-lg font-medium text-white">AI That Explains</h3>
            <p className="mt-2 text-sm text-white/70">
              Get context-aware reflections on past decisions without advice or judgment.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all hover:bg-white/15">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-serif text-lg font-medium text-white">Privacy First</h3>
            <p className="mt-2 text-sm text-white/70">
              Your memories are stored locally. You control what's remembered and what's deleted.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium text-white">Decision Timeline</h2>
            <p className="text-sm text-white/60">
              Your recorded decisions, chronologically ordered
            </p>
          </div>
        </div>
        <DecisionTimeline decisions={decisions} />
      </section>
    </Layout>
  );
};

export default Index;
