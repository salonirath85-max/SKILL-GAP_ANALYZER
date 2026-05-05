import { useMemo } from 'react';
import { Brain, TrendingUp, Calendar, Target } from 'lucide-react';
import { Decision } from '@/types/decision';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsDashboardProps {
  decisions: Decision[];
}

export function StatisticsDashboard({ decisions }: StatisticsDashboardProps) {
  const stats = useMemo(() => {
    const totalDecisions = decisions.length;
    
    // Domain breakdown
    const domainCounts = decisions.reduce((acc, decision) => {
      acc[decision.domain] = (acc[decision.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Average confidence
    const avgConfidence = decisions.length > 0
      ? Math.round(decisions.reduce((sum, d) => sum + (d.confidence || 50), 0) / decisions.length)
      : 0;
    
    // Recent decisions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDecisions = decisions.filter(d => 
      new Date(d.createdAt) >= sevenDaysAgo
    ).length;
    
    // Monthly trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyDecisions = decisions.filter(d => 
      new Date(d.createdAt) >= thirtyDaysAgo
    ).length;
    
    return {
      totalDecisions,
      topDomain: topDomain?.[0] || 'N/A',
      topDomainCount: topDomain?.[1] || 0,
      avgConfidence,
      recentDecisions,
      monthlyDecisions,
      domainCounts,
    };
  }, [decisions]);

  if (decisions.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-medium text-white mb-6">Your Decision Insights</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Decisions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Total Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalDecisions}</div>
            <p className="text-xs text-white/50 mt-1">
              {stats.monthlyDecisions} this month
            </p>
          </CardContent>
        </Card>

        {/* Average Confidence */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.avgConfidence}%</div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
                style={{ width: `${stats.avgConfidence}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.recentDecisions}</div>
            <p className="text-xs text-white/50 mt-1">
              {stats.recentDecisions > 0 ? 'Active decision making!' : 'No recent decisions'}
            </p>
          </CardContent>
        </Card>

        {/* Top Domain */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Domain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">{stats.topDomain}</div>
            <p className="text-xs text-white/50 mt-1">
              {stats.topDomainCount} decision{stats.topDomainCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Breakdown */}
      <Card className="mt-4 bg-white/10 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-serif">Decision Distribution by Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.domainCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([domain, count]) => {
                const percentage = Math.round((count / stats.totalDecisions) * 100);
                return (
                  <div key={domain} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 capitalize">{domain}</span>
                      <span className="text-white/60">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
