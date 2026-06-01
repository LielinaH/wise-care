'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Send, Lock, Sparkles, Loader2, Clipboard, Edit2, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { ChatMessageDoc } from '@/lib/firebase/types';
import Badge from '../ui/Badge';

interface ProviderChatPanelProps {
  referralId: string;
  providerId: string;
  providerName: string;
  patientName: string;
  carePacketId: string;
}

export default function ProviderChatPanel({
  referralId,
  providerId,
  providerName,
  patientName,
  carePacketId
}: ProviderChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [carePacket, setCarePacket] = useState<any | null>(null);

  // AI Intake Summary States
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummaryText, setEditedSummaryText] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // AI Reply Draft States
  const [draftingReply, setDraftingReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Care Packet & Subscribe to messages
  useEffect(() => {
    setLoading(true);
    setSummary(null);
    setIsEditingSummary(false);
    
    // Fetch care packet
    if (carePacketId) {
      firestoreHelpers.getCarePacket(carePacketId)
        .then(packet => setCarePacket(packet))
        .catch(err => console.error("Error loading care packet for chat:", err));
    }

    const unsubscribe = firestoreHelpers.subscribeChatMessages(referralId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [referralId, carePacketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await firestoreHelpers.sendChatMessage(referralId, providerId, providerName, text.trim());
      setText('');
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const intakeAnswers = carePacket ? {
        concerns: carePacket.mainConcerns || [],
        concernDetail: `Timeline: ${carePacket.timeline || ''}. Daily impact: ${carePacket.dailyLifeImpact?.join(', ') || ''}`,
        insurance: carePacket.insurancePaymentNotes?.join(' · ') || 'Not specified',
        urgency: 'Standard'
      } : null;

      const res = await fetch('/api/ai/summarize-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, intakeAnswers })
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setEditedSummaryText(data.summary);
      } else {
        throw new Error("Failed to summarize");
      }
    } catch (e) {
      console.error("Error generating clinical summary:", e);
      alert("Failed to generate AI Clinical Intake Summary.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleDraftReply = async () => {
    setDraftingReply(true);
    try {
      const res = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, providerName })
      });

      if (res.ok) {
        const data = await res.json();
        setText(data.draft);
      } else {
        throw new Error("Failed to draft reply");
      }
    } catch (e) {
      console.error("Error generating reply draft:", e);
    } finally {
      setDraftingReply(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedSummaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px] mt-4 enter">
      {/* Messaging Panel (Left Column) */}
      <div className={`flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md ${summary ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--teal-deep)]" />
            <span className="text-sm font-semibold text-[var(--fg)]">Secure Thread: {patientName}</span>
            <Badge variant="teal" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono tracking-wider">
              <Lock className="w-3 h-3 text-[var(--teal-deep)]" /> SECURE
            </Badge>
          </div>
          
          <button
            onClick={handleGenerateSummary}
            disabled={summarizing || messages.length === 0}
            className="btn btn-soft btn-xs text-[11px] font-semibold py-1 px-2.5 flex items-center gap-1 hover:bg-[var(--teal-soft)] border border-[var(--teal-deep)]/20"
          >
            {summarizing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[var(--teal-deep)]" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[var(--teal-deep)]" />
                ✨ Generate AI Intake Summary
              </>
            )}
          </button>
        </div>

        {/* Warning Notice */}
        <div className="px-4 py-2 bg-[var(--teal-soft)] border-b border-[var(--hairline)] text-[12px] text-[oklch(32% 0.07 200)] flex gap-2 items-start">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--teal-deep)]" />
          <span>
            <strong>Secure Intake Box:</strong> This is a prototype chat stream. Do not paste actual protected patient details.
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface-2)]/30">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-[var(--teal-deep)] animate-spin" />
              <span className="text-xs text-[var(--muted)]">Connecting to secure stream...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--muted)] italic">
              No messages. Chat will activate when status is updated.
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === providerId;
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

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--hairline)] flex flex-col gap-2 bg-[var(--surface)]">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type clinical outreach message securely..."
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
          </div>
          
          {/* AI Reply Drafting Assistance */}
          <div className="flex justify-between items-center px-1">
            <button
              type="button"
              onClick={handleDraftReply}
              disabled={draftingReply || messages.length === 0}
              className="text-[11.5px] font-semibold text-[var(--teal-deep)] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {draftingReply ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating professional draft reply...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  ✨ Draft AI Reply
                </>
              )}
            </button>
            <span className="text-[10px] text-[var(--muted-2)] font-mono">Clinician Panel</span>
          </div>
        </form>
      </div>

      {/* AI Clinical Brief Panel (Right Column) */}
      {summary && (
        <div className="lg:col-span-5 flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--hairline)]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--teal-deep)]" />
              <span className="text-sm font-semibold text-[var(--fg)]">AI Clinical Intake Brief</span>
            </div>
            <button 
              onClick={() => setSummary(null)} 
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
            >
              ✕ Close
            </button>
          </div>

          <div className="px-3.5 py-2 bg-[var(--surface-3)] text-[11px] text-[var(--muted)] border-b border-[var(--hairline)] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>AI Draft. Review, edit, and copy to patient record chart.</span>
          </div>

          {/* Clinical summary content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--bg)] text-xs text-[var(--fg)]">
            {isEditingSummary ? (
              <textarea
                value={editedSummaryText}
                onChange={(e) => setEditedSummaryText(e.target.value)}
                className="w-full h-full p-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--teal-deep)] bg-[var(--surface)] text-[12.5px] leading-relaxed"
                style={{ resize: 'none' }}
              />
            ) : (
              <div 
                className="prose prose-sm max-w-none text-[12.5px] leading-relaxed font-mono whitespace-pre-wrap select-text p-1"
                style={{ color: 'var(--fg)' }}
              >
                {editedSummaryText}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="p-3 border-t border-[var(--hairline)] bg-[var(--surface-2)] flex gap-2 justify-end">
            {isEditingSummary ? (
              <button
                onClick={() => setIsEditingSummary(false)}
                className="btn btn-soft btn-sm text-[11px] font-semibold py-1.5 px-3 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Edits
              </button>
            ) : (
              <button
                onClick={() => setIsEditingSummary(true)}
                className="btn btn-ghost btn-sm text-[11px] font-semibold py-1.5 px-3 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Summary
              </button>
            )}

            <button
              onClick={copyToClipboard}
              className="btn btn-primary btn-sm text-[11px] font-semibold py-1.5 px-3 flex items-center gap-1 justify-center"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" /> Copy SOAP Brief
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
