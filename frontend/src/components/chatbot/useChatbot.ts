import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToEnd = () => {
    try {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  const sendMessage = useCallback(async (textRaw: string) => {
    const text = (textRaw || '').trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: text });
      const reply: string = data?.reply || 'No response';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Chat request failed';
      toast.error(msg);
      setMessages(next);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }, [messages, loading]);

  return { messages, setMessages, loading, sendMessage, endRef };
}

export default useChatbot;


