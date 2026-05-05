import { Link } from 'react-router-dom';
import { Brain, Plus, Shield, Eye, Database, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useDecisionStore } from '@/store/decisionStore';
import { Layout } from '@/components/layout/Layout';
import { DecisionTimeline } from '@/components/decisions/DecisionTimeline';
import { StatisticsDashboard } from '@/components/dashboard/StatisticsDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Decision } from '@/types/decision';

const Index = () => {
  const decisions = useDecisionStore((state) => state.decisions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  // Get unique domains
  const domains = Array.from(new Set(decisions.map(d => d.domain)));

  // Filter decisions based on search and domain filter
  const filteredDecisions = decisions.filter((decision: Decision) => {
    const matchesSearch = searchQuery === '' || 
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.reasoning.some((r: string) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = filterDomain === 'all' || decision.domain === filterDomain;
    
    return matchesSearch && matchesDomain;
  });

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

      {/* Statistics Dashboard */}
      <StatisticsDashboard decisions={decisions} />

      {/* Search and Filter */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              type="text"
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/10 border border-white/10 rounded-md text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all" className="bg-[#0a0e27]">All Domains</option>
              {domains.map((domain) => (
                <option key={domain} value={domain} className="bg-[#0a0e27] capitalize">
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchQuery || filterDomain !== 'all') && (
          <p className="text-sm text-white/50 mt-2">
            Showing {filteredDecisions.length} of {decisions.length} decisions
          </p>
        )}
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
        <DecisionTimeline decisions={filteredDecisions} />
      </section>
    </Layout>
  );
};

export default Index;
