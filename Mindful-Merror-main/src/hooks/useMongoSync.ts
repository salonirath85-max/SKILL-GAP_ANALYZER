import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sessionId: string;
}

const SYNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mongodb-sync`;

export function useMongoSync() {
  const sessionId = useRef<string>(getOrCreateSessionId());

  function getOrCreateSessionId(): string {
    const stored = localStorage.getItem('chat_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chat_session_id', newId);
    return newId;
  }

  const syncMessage = useCallback(async (message: Omit<SyncMessage, 'sessionId'>) => {
    try {
      await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'insertOne',
          collection: 'chat_messages',
          data: {
            ...message,
            sessionId: sessionId.current,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to sync message to MongoDB:', error);
    }
  }, []);

  const syncDecision = useCallback(async (decision: any) => {
    try {
      await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'updateOne',
          collection: 'decisions',
          filter: { id: decision.id },
          data: decision,
        }),
      });
    } catch (error) {
      console.error('Failed to sync decision to MongoDB:', error);
    }
  }, []);

  const loadChatHistory = useCallback(async (): Promise<SyncMessage[]> => {
    try {
      const response = await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'find',
          collection: 'chat_messages',
          filter: {},
        }),
      });
      
      if (!response.ok) return [];
      
      const result = await response.json();
      return result.documents || [];
    } catch (error) {
      console.error('Failed to load chat history from MongoDB:', error);
      return [];
    }
  }, []);

  const loadSessionHistory = useCallback(async (targetSessionId?: string): Promise<SyncMessage[]> => {
    try {
      const response = await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'findBySession',
          collection: 'chat_messages',
          sessionId: targetSessionId || sessionId.current,
        }),
      });
      
      if (!response.ok) return [];
      
      const result = await response.json();
      return result.documents || [];
    } catch (error) {
      console.error('Failed to load session history:', error);
      return [];
    }
  }, []);

  const getSessions = useCallback(async () => {
    try {
      const response = await fetch(SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'getSessions',
          collection: 'chat_messages',
        }),
      });
      
      if (!response.ok) return [];
      
      const result = await response.json();
      const messages = result.documents || [];
      
      // Group by session and get latest message from each
      const sessionMap = new Map<string, any>();
      messages.forEach((msg: any) => {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, msg);
        }
      });
      
      return Array.from(sessionMap.entries()).map(([id, msg]) => ({
        sessionId: id,
        lastMessage: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
        timestamp: msg.createdAt || msg.timestamp,
      }));
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }, []);

  const startNewSession = useCallback(() => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chat_session_id', newId);
    sessionId.current = newId;
    return newId;
  }, []);

  return {
    sessionId: sessionId.current,
    syncMessage,
    syncDecision,
    loadChatHistory,
    loadSessionHistory,
    getSessions,
    startNewSession,
  };
}
