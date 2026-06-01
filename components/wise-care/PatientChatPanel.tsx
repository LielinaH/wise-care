'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Send, Lock, X, MessageSquare, Loader2 } from 'lucide-react';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { ChatMessageDoc } from '@/lib/firebase/types';
import Badge from '../ui/Badge';

interface PatientChatPanelProps {
  referralId: string;
  patientId: string;
  patientName: string;
  providerName: string;
  onClose: () => void;
}

export default function PatientChatPanel({
  referralId,
  patientId,
  patientName,
  providerName,
  onClose
}: PatientChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = firestoreHelpers.subscribeChatMessages(referralId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [referralId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await firestoreHelpers.sendChatMessage(referralId, patientId, patientName || 'Patient', text.trim());
      setText('');
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl mt-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--hairline)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--teal-deep)]" />
          <span className="text-sm font-semibold text-[var(--fg)]">Secure Messaging with {providerName}</span>
          <Badge variant="teal" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono tracking-wider">
            <Lock className="w-3 h-3 text-[var(--teal-deep)]" /> SECURE
          </Badge>
        </div>
        <button 
          onClick={onClose}
          type="button"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-3)] hover:text-[var(--fg)] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Notice */}
      <div className="px-4 py-2.5 bg-[var(--teal-soft)] border-b border-[var(--hairline)] text-[12px] text-[oklch(32% 0.07 200)] flex gap-2 items-start">
        <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--teal-deep)]" />
        <span>
          <strong>Demo Sandbox:</strong> Wise Care is a prototype. Do not send real clinical, medical, or HIPAA-regulated information.
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface-2)]/30">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-[var(--teal-deep)] animate-spin" />
            <span className="text-xs text-[var(--muted)]">Connecting to secure endpoint...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--muted)] italic">
            No messages yet. Send a message to start the secure thread.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === patientId;
            const timeStr = msg.createdAt && msg.createdAt.seconds 
              ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Sent';

            return (
              <div 
                key={msg.messageId || idx} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}
              >
                <span className="text-[10px] text-[var(--muted)] mb-1 px-1 font-semibold">{msg.senderName}</span>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] shadow-sm leading-relaxed ${
                    isMe 
                      ? 'bg-[var(--teal-deep)] text-white rounded-br-none' 
                      : 'bg-[var(--surface)] border border-[var(--hairline)] text-[var(--fg)] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[var(--muted-2)] mt-1 px-1 font-mono">{timeStr}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-[var(--hairline)] flex gap-2 bg-[var(--surface)]">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message securely..."
          className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--teal-deep)] text-[var(--fg)] placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="btn btn-primary flex items-center justify-center px-4"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
