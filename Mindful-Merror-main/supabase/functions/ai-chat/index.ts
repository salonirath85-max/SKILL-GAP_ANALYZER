import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intent classification
type IntentType = 'CONVERSATION' | 'EXPLORATION' | 'DECISION' | 'REFLECTION';

const DECISION_KEYWORDS = [
  'should i', 'help me decide', 'what should i choose',
  'confused between', 'which is better', 'take or not',
  'help me pick', 'deciding between', 'can\'t decide',
  'torn between', 'weighing options', 'pros and cons'
];

const REFLECTION_KEYWORDS = [
  'based on my past', 'what did i do earlier', 'check my timeline',
  'previous decision', 'my history', 'last time i',
  'remember when', 'recall my', 'why did i',
  'what was my reasoning', 'decisions i made', 'pattern in my'
];

const SOCIAL_EMOTIONAL_PHRASES = [
  'thinking about you', 'miss you', 'feel lonely',
  'feel happy', 'feel sad', 'just wanted to talk',
  'feeling', 'i love', 'i hate', 'worried about',
  'excited about', 'scared of', 'grateful', 'thankful',
  'appreciate', 'means a lot', 'care about', 'stressed',
  'anxious', 'nervous', 'hopeful', 'confused', 'overwhelmed'
];

function classifyIntent(text: string): IntentType {
  const lower = text.toLowerCase().trim();
  
  if (REFLECTION_KEYWORDS.some(k => lower.includes(k))) return 'REFLECTION';
  if (DECISION_KEYWORDS.some(k => lower.includes(k))) return 'DECISION';
  if (lower.split(/\s+/).length < 5) return 'CONVERSATION';
  if (lower.includes('?')) return 'EXPLORATION';
  
  return 'CONVERSATION';
}

function isSocialOrEmotional(text: string): boolean {
  const lower = text.toLowerCase();
  return SOCIAL_EMOTIONAL_PHRASES.some(p => lower.includes(p));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, decisions, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the latest user message for intent classification
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userText = lastUserMessage?.content || '';
    const intent = classifyIntent(userText);
    const isEmotional = isSocialOrEmotional(userText);

    // Build context about past decisions for the AI
    let decisionContext = '';
    if (decisions && decisions.length > 0) {
      decisionContext = `\n\nThe user has recorded these past decisions:\n${decisions.slice(0, 10).map((d: any) => 
        `- "${d.title}" (${d.domain}, ${new Date(d.created_at || d.createdAt).toLocaleDateString()}): Chose "${d.final_choice || d.finalChoice}". Intent: "${d.intent_primary || d.intent?.primary}"`
      ).join('\n')}`;
    }

    // Build conversation history context
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = `\n\nPrevious conversation context from past sessions:\n${conversationHistory.slice(-20).map((m: any) => 
        `${m.role === 'user' ? 'User' : 'You'}: ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`
      ).join('\n')}`;
    }

    // Dynamic system prompt - adaptive and analytical
    const systemPrompt = `You are an adaptive decision analyst. Analyze. Adapt. Respond fast.

CORE BEHAVIOR:
- Analyze user's communication style and match it
- If they're brief, be brief. If they elaborate, provide depth
- No fluff. No excessive friendliness. Direct and useful
- Adjust your approach based on what the user actually needs

RESPONSE RULES:
- 1-2 sentences for simple queries
- Only expand when complexity demands it
- Skip pleasantries. Get to the point
- No emojis unless the user uses them first

ADAPTIVE MODES:
${intent === 'DECISION' ? '→ DECISION MODE: Help them choose. Present options clearly. No hand-holding.' : ''}
${intent === 'REFLECTION' ? '→ REFLECTION MODE: Analyze patterns from their history. Give insights, not comfort.' : ''}
${intent === 'EXPLORATION' ? '→ EXPLORATION MODE: Answer directly. Add context only if useful.' : ''}
${intent === 'CONVERSATION' ? '→ CONVERSATION MODE: Match their energy. Be natural, not performative.' : ''}

${isEmotional ? 'User seems to be sharing something personal. Acknowledge briefly, then be useful.' : ''}

SELF-MODIFICATION:
- Track how the user responds to you
- If they seem frustrated, simplify
- If they want depth, provide analysis
- Mirror their language patterns${decisionContext}${historyContext}

You adapt. You analyze. You deliver.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
