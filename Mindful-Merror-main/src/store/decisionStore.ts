import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Decision } from '@/types/decision';
import { sampleDecisions } from '@/data/sampleDecisions';

interface DecisionStore {
  decisions: Decision[];
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  getDecisionById: (id: string) => Decision | undefined;
  getDecisionsByDomain: (domain: Decision['domain']) => Decision[];
  searchDecisions: (query: string) => Decision[];
  recordRecall: (id: string) => void;
}

export const useDecisionStore = create<DecisionStore>()(
  persist(
    (set, get) => ({
      decisions: sampleDecisions,
      
      addDecision: (decision) =>
        set((state) => ({
          decisions: [decision, ...state.decisions],
        })),
      
      updateDecision: (id, updates) =>
        set((state) => ({
          decisions: state.decisions.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      
      deleteDecision: (id) =>
        set((state) => ({
          decisions: state.decisions.filter((d) => d.id !== id),
        })),
      
      getDecisionById: (id) => {
        return get().decisions.find((d) => d.id === id);
      },
      
      getDecisionsByDomain: (domain) => {
        return get().decisions.filter((d) => d.domain === domain);
      },
      
      searchDecisions: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().decisions.filter(
          (d) =>
            d.title.toLowerCase().includes(lowerQuery) ||
            d.description?.toLowerCase().includes(lowerQuery) ||
            d.reasoning.some((r) => r.toLowerCase().includes(lowerQuery)) ||
            d.finalChoice.toLowerCase().includes(lowerQuery)
        );
      },
      
      recordRecall: (id) =>
        set((state) => ({
          decisions: state.decisions.map((d) =>
            d.id === id ? { ...d, lastRecalledAt: new Date().toISOString() } : d
          ),
        })),
    }),
    {
      name: 'memory-decisions',
    }
  )
);
