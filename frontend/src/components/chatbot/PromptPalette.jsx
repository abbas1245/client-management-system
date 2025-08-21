import React from 'react';
import { Command } from 'cmdk';

export default function PromptPalette({ open, onClose, onSelect }) {
  if (!open) return null;
  const prompts = [
    { id: 'project_today', label: "What's today's project?" },
    { id: 'leads_week', label: 'Show leads added this week' },
    { id: 'client_addr', label: "What's Abbas client address?" },
  ];

  return (
    <div className="absolute inset-0 z-[60] flex items-start justify-center pt-10">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <Command className="relative w-[90%] max-w-lg rounded-2xl bg-white text-black shadow-2xl overflow-hidden focus:outline-none">
        <Command.Input autoFocus placeholder="Type a prompt..." className="w-full px-3 py-3 text-sm outline-none border-b border-black/10" />
        <Command.List className="max-h-60 overflow-y-auto">
          {prompts.map((p) => (
            <Command.Item
              key={p.id}
              value={p.label}
              onSelect={(val) => { onSelect?.(val); onClose?.(); }}
              className="px-3 py-2 text-sm hover:bg-black/5 cursor-pointer"
            >
              {p.label}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}


