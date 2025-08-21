import React, { useState } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import useChatbot from './useChatbot';

const quickPrompts = [
  "What's today's project?",
  'Show leads added this week',
  "What's Abbas client address?",
];

export default function ChatBot() {
  const { messages, loading, sendMessage, endRef } = useChatbot();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <Button onClick={() => setOpen(true)} className="rounded-full h-12 w-12 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
          <Sparkles className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-[360px] sm:w-[420px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl text-white shadow-2xl overflow-hidden">
          <div className="relative h-14 bg-gradient-to-r from-blue-500/30 via-purple-500/25 to-fuchsia-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative h-full px-4 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-white/90" />
                <div className="font-semibold text-white/90">AI Assistant</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white/90">×</button>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {quickPrompts.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} className="whitespace-nowrap text-xs rounded-full px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ScrollArea className="h-80 px-3 py-3">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={
                    'inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ' +
                    (m.role === 'user' ? 'bg-white/15' : 'bg-white/8 border border-white/10')
                  }>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm bg-white/8 border border-white/10">
                    <span className="w-3 h-3 rounded-full bg-white/70 animate-pulse" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={endRef as any} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-white/10 flex items-center gap-2">
            <Input
              value={input}
              placeholder="Ask about clients, leads, projects..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(input);
                  setInput('');
                }
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50 rounded-xl"
            />
            <Button
              onClick={() => { sendMessage(input); setInput(''); }}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


