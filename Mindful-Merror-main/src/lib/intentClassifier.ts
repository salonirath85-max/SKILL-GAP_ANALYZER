// Intent Classifier for Two-Mode AI Behavior
// Separates conversational mode from decision reflection mode

export type IntentType = 'CONVERSATION' | 'EXPLORATION' | 'DECISION' | 'REFLECTION';

const DECISION_KEYWORDS = [
  'should i', 'help me decide', 'what should i choose',
  'confused between', 'which is better', 'take or not',
  'help me pick', 'what would you suggest', 'deciding between',
  'can\'t decide', 'torn between', 'weighing options',
  'pros and cons', 'better option', 'right choice',
  'make a decision', 'decide on', 'choosing between'
];

const REFLECTION_KEYWORDS = [
  'based on my past', 'what did i do earlier', 'check my timeline',
  'previous decision', 'my history', 'last time i',
  'remember when', 'recall my', 'look back at',
  'past reasoning', 'why did i', 'what was my reasoning',
  'my earlier choice', 'decisions i made', 'pattern in my',
  'timeline', 'what have i decided'
];

const GREETING_PATTERNS = /^(hi|hello|hey|yo|good morning|good afternoon|good evening|howdy|sup|what's up)\b/i;

const CASUAL_PATTERNS = /^(thanks|thank you|okay|ok|got it|i see|understood|cool|great|awesome|nice)\b/i;

// Social/Emotional phrases that require acknowledgment
const SOCIAL_EMOTIONAL_PHRASES = [
  'thinking about you',
  'miss you',
  'feel lonely',
  'feel happy',
  'feel sad',
  'just wanted to talk',
  'feeling',
  'i love',
  'i hate',
  'worried about',
  'excited about',
  'scared of',
  'grateful',
  'thankful',
  'appreciate',
  'means a lot',
  'care about',
  'been thinking',
  'on my mind'
];

export function classifyIntent(userInput: string): IntentType {
  const lowerInput = userInput.toLowerCase().trim();
  
  // Check for greetings first
  if (GREETING_PATTERNS.test(lowerInput)) {
    return 'CONVERSATION';
  }
  
  // Check for casual acknowledgments
  if (CASUAL_PATTERNS.test(lowerInput)) {
    return 'CONVERSATION';
  }
  
  // Check for reflection keywords
  if (REFLECTION_KEYWORDS.some(k => lowerInput.includes(k))) {
    return 'REFLECTION';
  }
  
  // Check for decision keywords
  if (DECISION_KEYWORDS.some(k => lowerInput.includes(k))) {
    return 'DECISION';
  }
  
  // Short messages are usually conversational
  if (lowerInput.split(/\s+/).length < 5) {
    return 'CONVERSATION';
  }
  
  // Questions that aren't decision-related are exploration
  if (lowerInput.includes('?')) {
    return 'EXPLORATION';
  }
  
  return 'CONVERSATION';
}

// Check if the message is social/emotional and needs acknowledgment
export function isSocialOrEmotional(userInput: string): boolean {
  const lowerInput = userInput.toLowerCase();
  return SOCIAL_EMOTIONAL_PHRASES.some(phrase => lowerInput.includes(phrase));
}

// Helper to determine if we should use memory
export function shouldUseMemory(intent: IntentType): boolean {
  return intent === 'DECISION' || intent === 'REFLECTION';
}

// Get a human-friendly description of the mode
export function getModeDescription(intent: IntentType): string {
  switch (intent) {
    case 'CONVERSATION':
      return 'Conversational';
    case 'EXPLORATION':
      return 'Exploring';
    case 'DECISION':
      return 'Decision Help';
    case 'REFLECTION':
      return 'Memory Reflection';
    default:
      return 'Conversational';
  }
}
