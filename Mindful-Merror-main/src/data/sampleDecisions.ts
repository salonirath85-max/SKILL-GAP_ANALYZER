import { Decision } from '@/types/decision';

export const sampleDecisions: Decision[] = [
  {
    id: 'DEC_001',
    title: 'Chose Startup Internship Over Full-Time Exam Prep',
    description: 'Decided between dedicating fully to competitive exam preparation or taking a part-time startup internship that offered practical experience and income.',
    domain: 'career',
    intent: {
      primary: 'Skill growth through hands-on experience',
      secondary: ['Income stability', 'Building professional network'],
      timeHorizon: '6 months',
    },
    constraints: {
      time: 'Limited - only 4 hours/day available after internship',
      financial: 'Low savings, needed income to support living expenses',
      emotional: 'Stressed about competitive exam pressure',
      riskTolerance: 'medium',
      other: ['Family expectations for exam success'],
    },
    alternatives: [
      {
        option: 'Full-time exam preparation',
        rejected: true,
        reason: 'No income source, financial stress would impact study quality',
        pros: ['More study time', 'Full focus on single goal'],
        cons: ['No income', 'Isolation', 'High pressure with no backup plan'],
      },
      {
        option: 'Startup internship (remote, part-time)',
        rejected: false,
        pros: ['Income stability', 'Real-world skills', 'Flexible hours', 'Backup career path'],
        cons: ['Less study time', 'Divided attention'],
      },
      {
        option: 'Full-time job',
        rejected: true,
        reason: 'Would completely eliminate exam preparation time',
        pros: ['Higher income'],
        cons: ['No time for exams', 'Abandoning academic goals'],
      },
    ],
    reasoning: [
      'Financial stability was necessary to reduce stress and focus on studies',
      'Remote work allowed flexibility to study during optimal hours',
      'Practical experience would serve as backup if exam results were not favorable',
      'Learning by doing aligned with my learning style better than pure theory',
    ],
    finalChoice: 'Startup internship (remote, part-time)',
    confidence: 0.72,
    visibility: 'private',
    reflection: 'The income reduced my anxiety significantly. I studied fewer hours but with better focus.',
    createdAt: '2024-03-15T10:30:00Z',
    lastRecalledAt: '2024-06-20T14:00:00Z',
  },
  {
    id: 'DEC_002',
    title: 'Kept Emergency Fund Instead of Investing',
    description: 'Decided whether to invest savings in the stock market or maintain a larger emergency fund during economic uncertainty.',
    domain: 'financial',
    intent: {
      primary: 'Financial security and peace of mind',
      secondary: ['Preserve capital', 'Maintain liquidity for unexpected expenses'],
      timeHorizon: '1 year',
    },
    constraints: {
      time: 'Uncertain job market, potential layoffs in industry',
      financial: '6 months expenses saved, no other liquid assets',
      emotional: 'Anxious about economic downturn news',
      riskTolerance: 'low',
      other: ['Partner also in uncertain job situation'],
    },
    alternatives: [
      {
        option: 'Invest 50% in index funds',
        rejected: true,
        reason: 'Market volatility too high, could not afford to lose capital',
        pros: ['Potential returns', 'Long-term growth'],
        cons: ['Market risk', 'Reduced emergency buffer', 'Emotional stress from market swings'],
      },
      {
        option: 'Keep full emergency fund in high-yield savings',
        rejected: false,
        pros: ['Guaranteed safety', 'Immediate liquidity', 'Peace of mind', 'Some interest income'],
        cons: ['Lower returns than market', 'Inflation erosion'],
      },
      {
        option: 'Invest 25% conservatively',
        rejected: true,
        reason: 'Even partial investment felt too risky given job uncertainty',
        pros: ['Balanced approach'],
        cons: ['Still exposed to loss', 'Complexity of managing'],
      },
    ],
    reasoning: [
      'Job security was genuinely uncertain, not just anxious thinking',
      'The peace of mind from having full emergency fund would help me perform better at work',
      'Missing potential gains felt less harmful than potential loss of security',
      'Partner agreed that stability was priority until at least one job felt secure',
    ],
    finalChoice: 'Keep full emergency fund in high-yield savings',
    confidence: 0.85,
    visibility: 'private',
    reflection: 'This was the right call. Two months later, my partner was laid off. The emergency fund covered three months of expenses.',
    outcome: 'Emergency fund used as intended. Rebuilt it before considering investments.',
    createdAt: '2024-01-10T09:00:00Z',
    lastRecalledAt: '2024-08-15T11:30:00Z',
  },
  {
    id: 'DEC_003',
    title: 'Declined Remote Team Lead Role',
    description: 'Was offered a promotion to team lead but declined due to concerns about remote management challenges and work-life balance.',
    domain: 'career',
    intent: {
      primary: 'Preserve work-life balance and mental health',
      secondary: ['Continue deep technical work', 'Avoid burnout'],
      timeHorizon: '2 years',
    },
    constraints: {
      time: 'Already working near capacity, young child at home',
      financial: 'Comfortable with current salary, raise was moderate',
      emotional: 'Previous management role led to burnout',
      riskTolerance: 'low',
      other: ['Partner starting new business, needed stability at home'],
    },
    alternatives: [
      {
        option: 'Accept team lead role',
        rejected: true,
        reason: 'Risk of repeating burnout pattern from previous management experience',
        pros: ['Higher salary', 'Career advancement', 'New skills'],
        cons: ['More meetings', 'Less coding', 'Managing people remotely is hard', 'Likely overtime'],
      },
      {
        option: 'Decline and stay in current role',
        rejected: false,
        pros: ['Stable hours', 'Technical focus', 'Known workload', 'Time for family'],
        cons: ['Missed advancement opportunity', 'Salary plateau'],
      },
      {
        option: 'Negotiate for hybrid role',
        rejected: true,
        reason: 'Company was not open to creating custom positions',
        pros: ['Best of both'],
        cons: ['Not available as option'],
      },
    ],
    reasoning: [
      'Past experience showed management roles trigger my anxiety patterns',
      'Current role allows deep focus work which energizes me',
      'Family situation required predictable schedule',
      'The salary increase did not justify the quality of life trade-off',
      'I can revisit leadership when child is older and partner business is stable',
    ],
    finalChoice: 'Decline and stay in current role',
    confidence: 0.78,
    visibility: 'selective',
    createdAt: '2024-05-22T16:45:00Z',
  },
];

export const getDomainColor = (domain: Decision['domain']): string => {
  const colors: Record<Decision['domain'], string> = {
    career: 'bg-blue-100 text-blue-700',
    financial: 'bg-green-100 text-green-700',
    personal: 'bg-purple-100 text-purple-700',
    health: 'bg-rose-100 text-rose-700',
    relationships: 'bg-amber-100 text-amber-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[domain];
};

export const getDomainIcon = (domain: Decision['domain']): string => {
  const icons: Record<Decision['domain'], string> = {
    career: '',
    financial: '💰',
    personal: '🌟',
    health: '❤️',
    relationships: '🤝',
    other: '📝',
  };
  return icons[domain];
};
