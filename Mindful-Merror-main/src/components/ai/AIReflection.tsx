import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Brain, Clock, Sparkles, MessageCircle, Lightbulb, AlertTriangle, History, ChevronDown, Search } from 'lucide-react';
import { useDecisionStore } from '@/store/decisionStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DomainBadge } from '@/components/decisions/DomainBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { classifyIntent, getModeDescription, shouldUseMemory, isSocialOrEmotional, type IntentType } from '@/lib/intentClassifier';
import { useAIChat } from '@/hooks/useAIChat';
import { useMongoSync } from '@/hooks/useMongoSync';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  relatedDecisions?: string[];
  timestamp: Date;
  mode?: IntentType;
}

const suggestedQuestions = [
  "I want to ask something",
  "Help me decide between two options",
  "What patterns do you see in my decisions?",
];

export function AIReflection() {
  const decisions = useDecisionStore((state) => state.decisions);
  const recordRecall = useDecisionStore((state) => state.recordRecall);

  const [searchParams] = useSearchParams();
  const decisionIdFromUrl = searchParams.get('decisionId');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<IntentType>('CONVERSATION');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [showConversationPicker, setShowConversationPicker] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(decisionIdFromUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { streamChat, isStreaming, error } = useAIChat();
  const { syncMessage, loadChatHistory } = useMongoSync();

  // Load previous chat history on mount
  useEffect(() => {
    loadChatHistory().then(history => {
      if (history.length > 0) {
        setConversationHistory(history);
      }
    });
  }, [loadChatHistory]);

  // Convert messages for API
  const apiMessages = useMemo(() => 
    messages.map(m => ({ role: m.role, content: m.content })),
    [messages]
  );

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      const focusDecision = decisionIdFromUrl 
        ? decisions.find((d) => d.id === decisionIdFromUrl) 
        : null;
      const focusHint = focusDecision
        ? `Focused on: "${focusDecision.title}".`
        : '';
      return [
        {
          role: 'assistant',
          content: `Ready. ${focusHint}\n\nSelect a conversation below to analyze, or start talking.`,
          timestamp: new Date(),
          mode: 'CONVERSATION',
        },
      ];
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSelectDecision = async (decisionId: string) => {
    setSelectedDecisionId(decisionId);
    setShowConversationPicker(false);
    setIsAnalyzing(true);

    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return;

    const analysisPrompt = `Analyze this decision in detail:
Title: ${decision.title}
Domain: ${decision.domain}
Description: ${decision.description || 'N/A'}
Alternatives: ${decision.alternatives?.map(a => `${a.option}${a.rejected ? ' (rejected)' : ''}: ${a.reason || ''}`).join('; ') || 'N/A'}
Final Choice: ${decision.finalChoice || 'N/A'}
Confidence: ${decision.confidence || 'N/A'}
Reasoning: ${decision.reasoning?.join(', ') || 'N/A'}
Created: ${decision.createdAt}

Give me: 1) Quick assessment 2) Key patterns 3) What this reveals about the user's decision-making style 4) Potential blind spots`;

    const userMessage: Message = {
      role: 'user',
      content: `Analyze my decision: "${decision.title}"`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    let assistantContent = '';
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.timestamp) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent, mode: 'REFLECTION' } as Message];
      });
    };

    await streamChat({
      messages: [{ role: 'user', content: analysisPrompt }],
      onDelta: updateAssistant,
      onDone: () => {
        setMessages(prev => 
          prev.map((m, i) => 
            i === prev.length - 1 && m.role === 'assistant'
              ? { ...m, timestamp: new Date() }
              : m
          )
        );
        setIsAnalyzing(false);
      },
      onError: () => {
        setMessages(prev => 
          prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && !m.timestamp))
        );
        setIsAnalyzing(false);
      }
    });
  };

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const intent = classifyIntent(input);
    setCurrentMode(intent);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    let assistantContent = '';
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.timestamp) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent, mode: intent } as Message];
      });
    };

    await streamChat({
      messages: [...apiMessages, { role: 'user', content: input }],
      onDelta: updateAssistant,
      onDone: () => {
        setMessages(prev => 
          prev.map((m, i) => 
            i === prev.length - 1 && m.role === 'assistant'
              ? { ...m, timestamp: new Date() }
              : m
          )
        );
        if (shouldUseMemory(intent)) {
          decisions.forEach(d => {
            if (assistantContent.toLowerCase().includes(d.title.toLowerCase())) {
              recordRecall(d.id);
            }
          });
        }
      },
      onError: () => {
        setMessages(prev => 
          prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && !m.timestamp))
        );
      }
    });
  };

  const getModeIcon = (mode?: IntentType) => {
    switch (mode) {
      case 'DECISION': return <Lightbulb className="h-3 w-3" />;
      case 'REFLECTION': return <Brain className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  const getModeColor = (mode?: IntentType) => {
    switch (mode) {
      case 'DECISION': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'REFLECTION': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">AI Analyst</h1>
        <p className="mt-2 text-white/70">
          Select a conversation to analyze or start a new one.
        </p>
      </div>

      {/* Conversation Picker Button */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setShowConversationPicker(!showConversationPicker)}
          className="group flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-white/15 hover:text-white"
        >
          <Search className="h-4 w-4" />
          {selectedDecisionId 
            ? `Selected: ${decisions.find(d => d.id === selectedDecisionId)?.title || 'Unknown'}`
            : 'Select a conversation to analyze'
          }
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            showConversationPicker && "rotate-180"
          )} />
        </button>
      </div>

      {/* Decision Picker Dropdown */}
      {showConversationPicker && (
        <div className="mb-4 rounded-xl border border-white/20 bg-black/70 p-2 backdrop-blur-xl animate-scale-in">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/50">Your Decisions</p>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {decisions.map(decision => (
              <button
                key={decision.id}
                onClick={() => {
                  setSelectedDecisionId(decision.id);
                  setShowConversationPicker(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all",
                  selectedDecisionId === decision.id
                    ? "bg-purple-500/30 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{decision.title}</p>
                  <p className="truncate text-xs text-white/40">{decision.domain} · {new Date(decision.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
            {decisions.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-white/40">No decisions yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Deep Analyze Button */}
      <div className="mb-6 flex justify-center">
        <Button
          onClick={() => selectedDecisionId && handleSelectDecision(selectedDecisionId)}
          disabled={!selectedDecisionId || isStreaming || isAnalyzing}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 disabled:opacity-40"
          size="lg"
        >
          <Sparkles className="h-5 w-5" />
          {isAnalyzing ? 'Analyzing...' : 'Deep Analyze'}
        </Button>
      </div>

      {/* Mode indicator */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <Badge variant="outline" className={cn("gap-1", getModeColor(currentMode))}>
          {getModeIcon(currentMode)}
          {getModeDescription(currentMode)} Mode
        </Badge>
        {(isStreaming || isAnalyzing) && (
          <Badge variant="outline" className="gap-1 animate-pulse border-green-500/30 bg-green-500/20 text-green-300">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            {isAnalyzing ? 'Analyzing' : 'Streaming'}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="mb-6 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-white/30" />
            <p className="text-white/50">Start a conversation or select a decision to analyze</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:border-purple-500/40 hover:bg-white/10 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl p-4 backdrop-blur-sm",
              message.role === 'user'
                ? "ml-8 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white"
                : "mr-8 border border-white/10 bg-white/5 text-white/90"
            )}
          >
            <div className="mb-2 flex items-center justify-between text-xs opacity-70">
              <div className="flex items-center gap-2">
                <span>{message.role === 'user' ? 'You' : 'NEXUS'}</span>
                {message.role === 'assistant' && message.mode && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getModeColor(message.mode))}>
                    {getModeDescription(message.mode)}
                  </Badge>
                )}
              </div>
              {message.timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {message.timestamp.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className={cn("prose prose-sm prose-invert max-w-none whitespace-pre-wrap")}>
              {message.content || (
                <span className="italic text-white/30">Processing...</span>
              )}
            </div>
            {message.relatedDecisions && message.relatedDecisions.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <span className="text-xs text-white/30">Related decisions:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.relatedDecisions.map((id) => {
                    const d = decisions.find((dec) => dec.id === id);
                    return d ? <DomainBadge key={id} domain={d.domain} size="sm" /> : null;
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="mr-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
              </div>
              <span>Processing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-4 rounded-xl border border-white/15 bg-black/60 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={2}
            className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!input.trim() || isStreaming}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-white/30">
          Press Enter to send. Select a decision above for deep analysis.
        </p>
      </div>
    </div>
  );
}
