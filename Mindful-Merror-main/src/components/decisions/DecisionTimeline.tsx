import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Decision } from '@/types/decision';
import { DecisionCard } from './DecisionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DecisionTimelineProps {
  decisions: Decision[];
}

const domains: Decision['domain'][] = ['career', 'financial', 'personal', 'health', 'relationships', 'other'];

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<Decision['domain'][]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'confidence'>('newest');

  const filteredDecisions = decisions
    .filter((d) => {
      const matchesSearch =
        searchQuery === '' ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.finalChoice.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain =
        selectedDomains.length === 0 || selectedDomains.includes(d.domain);

      return matchesSearch && matchesDomain;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const toggleDomain = (domain: Decision['domain']) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Domain
                {selectedDomains.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {selectedDomains.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by domain</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {domains.map((domain) => (
                <DropdownMenuCheckboxItem
                  key={domain}
                  checked={selectedDomains.includes(domain)}
                  onCheckedChange={() => toggleDomain(domain)}
                  className="capitalize"
                >
                  {domain}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'newest'}
                onCheckedChange={() => setSortOrder('newest')}
              >
                Newest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'oldest'}
                onCheckedChange={() => setSortOrder('oldest')}
              >
                Oldest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'confidence'}
                onCheckedChange={() => setSortOrder('confidence')}
              >
                Highest confidence
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredDecisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-secondary p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-medium">No decisions found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? 's' : ''} in your memory
          </p>
          <div className="space-y-0">
            {filteredDecisions.map((decision, index) => (
              <div
                key={decision.id}
                className={cn(
                  "animate-slide-up",
                  `[animation-delay:${index * 100}ms]`
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DecisionCard decision={decision} showTimeline />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
