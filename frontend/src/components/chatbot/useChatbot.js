import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import api from '../../lib/axios';

export function useChatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToEnd = () => {
    try {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  const sendMessage = useCallback(async (textRaw) => {
    const text = (textRaw || '').trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      let data;
      try {
        ({ data } = await api.post('/chat', { message: text }));
      } catch (err) {
        // Fallback to legacy endpoint if new one is not available
        if (err?.response?.status === 404) {
          ({ data } = await api.post('/chatbot', { message: text, scope: 'auto' }));
        } else {
          throw err;
        }
      }
      const reply = data?.reply || data?.answer || 'No response';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err) {
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


