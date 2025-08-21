import React, { useEffect, useMemo, useState } from 'react';
import { Send, MessageSquare, Sparkles, Download, Command as CommandIcon, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import useChatbot from './useChatbot';
import PromptPalette from './PromptPalette.jsx';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Removed quickPrompts array since default topics are no longer shown

export default function ChatBot() {
  const { messages, loading, sendMessage, endRef, setMessages } = useChatbot();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Format assistant messages that look like dates with date-fns (simple heuristic)
  const displayMessages = useMemo(() => messages.map((m) => {
    if (m.role === 'assistant' && /\b\d{4}-\d{2}-\d{2}\b/.test(m.content)) {
      try {
        const formatted = m.content.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (d) => {
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? d : format(dt, 'PP');
        });
        return { ...m, content: formatted };
      } catch { return m; }
    }
    return m;
  }), [messages]);

  // Refresh function to clear all messages and start fresh
  const handleRefresh = () => {
    if (messages.length > 0) {
      if (window.confirm('Are you sure you want to clear all messages and start a fresh conversation?')) {
        setMessages([]);
        setInput('');
      }
    } else {
      // If no messages, just clear input
      setInput('');
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const exportCsv = () => {
    const rows = [['role', 'content']].concat(messages.map((m) => [m.role, m.content]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chat');
    XLSX.writeFile(wb, `chat-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {!open ? (
        <Button onClick={() => setOpen(true)} className="rounded-full h-14 w-14 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/30 border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-110">
          <Sparkles className="h-6 w-6" />
        </Button>
      ) : (
        <div className="w-[380px] sm:w-[440px] rounded-3xl border-2 border-white/20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl text-white shadow-2xl shadow-purple-500/20 overflow-hidden">
          <div className="relative h-16 bg-gradient-to-r from-purple-600/20 via-pink-500/15 to-purple-600/20 border-b border-white/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.03),transparent_40%)]" />
            <div className="relative h-full px-4 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="font-bold text-white text-lg">AI Assistant</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPaletteOpen(true)} title="Command Palette (Ctrl/Cmd+K)" className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10">
                  <CommandIcon className="h-4 w-4" />
                </button>
                <button onClick={handleRefresh} title="Refresh chat" className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10 hover:rotate-180 transition-transform duration-300">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={exportCsv} title="Export chat" className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded hover:bg-white/10 text-xl font-bold">×</button>
              </div>
            </div>
          </div>

          {/* Removed default topics section */}

          <ScrollArea className="h-80 px-4 py-4">
            <div className="space-y-4">
              {displayMessages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                                  <div className={
                  'inline-block max-w-[85%] rounded-2xl px-4 py-3 text-sm ' +
                  (m.role === 'user' ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white border border-white/20' : 'bg-white/5 border border-white/20 text-white/90')
                }>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/20">
                    <span className="w-3 h-3 rounded-full bg-purple-400" />
                    <span className="text-white/80">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <textarea
                value={input}
                placeholder="Ask about clients, leads, projects..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                    setInput('');
                  }
                }}
                rows={1}
                className="flex-1 resize-none bg-white/5 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              />
              <Button
                onClick={() => { sendMessage(input); setInput(''); }}
                disabled={!input.trim() || loading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <PromptPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelect={(val) => sendMessage(val)} />
        </div>
      )}
    </div>
  );
}


