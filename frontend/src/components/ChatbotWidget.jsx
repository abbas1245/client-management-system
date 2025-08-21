import React, { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
// Popover not used currently; keep import only when needed
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const canSend = input.trim().length > 0 && !loading;

  const sendMessage = async () => {
    if (!canSend) return;
    const text = input.trim();
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/chatbot`, { message: text, scope: 'auto' });
      setMessages([...next, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      const message = err?.response?.data?.error || 'Chatbot request failed';
      toast.error(message);
      setMessages(next);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <Button onClick={() => setOpen(true)} className="rounded-full h-12 w-12 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
          <Sparkles className="h-5 w-5" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl text-white max-w-lg">
          <div className="relative h-16 bg-gradient-to-r from-blue-500/30 via-purple-500/25 to-fuchsia-500/20 border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative h-full flex items-center px-5 gap-2">
              <Bot className="h-5 w-5 text-white/90" />
              <div className="font-semibold text-white/90">Assistant</div>
            </div>
          </div>
          <div className="flex flex-col h-[480px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <div className={
                      'inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm ' +
                      (m.role === 'user' ? 'bg-white/15' : 'bg-white/8 border border-white/10')
                    }>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-left">
                    <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm bg-white/8 border border-white/10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <Input
                value={input}
                placeholder="Ask about clients, projects, meetings..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/50 rounded-xl"
              />
              <Button onClick={sendMessage} disabled={!canSend} className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


