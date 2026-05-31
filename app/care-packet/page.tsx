'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import PremiumCard from '@/components/ui/PremiumCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';
import ActionChecklist from '@/components/ui/ActionChecklist';
import { storage } from '@/lib/storage';
import { CarePacket, CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  Copy, 
  Check, 
  Send, 
  Loader2
} from 'lucide-react';

export default function CarePacketPage() {
  const router = useRouter();
  const [packet, setPacket] = useState<CarePacket | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const route = storage.getCareRoute();
    const intake = storage.getIntake();
    const cachedPacket = storage.getCarePacket();

    if (!intake.concerns || !route) {
      router.push('/dashboard');
      return;
    }

    if (cachedPacket) {
      setPacket(cachedPacket);
    } else {
      // Trigger live generation
      generatePacket(intake as IntakeAnswers, route);
    }
  }, [router]);

  const generatePacket = async (intake: IntakeAnswers, route: CareRouteResult) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/care-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, careRoute: route }),
      });
      if (res.ok) {
        const data = await res.json();
        setPacket(data);
        storage.setCarePacket(data);
      } else {
        throw new Error('Failed to generate Care Packet');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'summary' | 'message') => {
    navigator.clipboard.writeText(text);
    if (type === 'summary') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Outreach template copied to clipboard!');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return (
      <AppShell title="Generating Care Packet" crumbs={['Care', 'Care Packet']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-wise-teal spin" />
          <p className="text-sm text-wise-muted font-medium">AI is structuring your clinician briefing packet...</p>
        </div>
      </AppShell>
    );
  }

  if (!packet) return null;

  return (
    <AppShell title="Care Packet" crumbs={['Care', 'Care Packet']} actions={
      <div className="flex gap-2">
        <Link href="/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
        <Link href="/connection-request" className="btn btn-primary btn-sm flex items-center gap-1.5">
          Share packet
          <Send className="w-3.5 h-3.5" />
        </Link>
      </div>
    }>
      <FallbackBanner isFallback={packet.isFallback} />

      <div className="enter-stagger space-y-6">
        
        {/* Banner toast */}
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Introduction Panel using Notice component */}
        <Notice variant="brand" title="Clinician-Ready Preparation Brief">
          This document structures your check-in parameters into a summary you can present to clinical providers during your intake call, saving you from repeating paperwork.
        </Notice>

        {/* Shareable Summary block */}
        <PremiumCard 
          variant="elevated" 
          kicker="Shared Clinician Summary" 
          title="Briefing Overview"
          action={
            <button
              onClick={() => copyToClipboard(packet.shareableSummary, 'summary')}
              className="btn btn-ghost btn-sm text-xs flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-wise-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-wise-muted" />
                  <span>Copy summary</span>
                </>
              )}
            </button>
          }
        >
          <div className="p-4 bg-wise-surface-sunk border border-wise-hairline rounded-xl text-[13.5px] leading-relaxed text-wise-fg-soft font-mono italic mt-3">
            "{packet.shareableSummary}"
          </div>
        </PremiumCard>

        {/* Checklist, Impact & Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Intake concerns */}
          <PremiumCard variant="standard" title="Symptoms & Life Impacts">
            <div className="space-y-4 mt-3">
              <div>
                <span className="text-[11px] text-wise-muted uppercase tracking-wider block mb-1">Focus Areas</span>
                <div className="flex flex-wrap gap-1">
                  {packet.mainConcerns.map((c, i) => <Badge key={i} variant="teal" showDot={false} className="text-[10px]">{c}</Badge>)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-wise-muted uppercase tracking-wider block mb-1.5">Timeline Details</span>
                <p className="text-xs text-wise-fg-soft leading-relaxed bg-wise-surface-sunk p-2.5 border border-wise-hairline rounded-lg">
                  {packet.timeline}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-wise-muted uppercase tracking-wider block mb-1.5">Areas Impacted</span>
                <ul className="b-list">
                  {packet.dailyLifeImpact.map((item, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft leading-normal">
                      <span className="dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PremiumCard>

          {/* Client Goals & preparation */}
          <PremiumCard variant="standard" title="Goals & Action Checklists">
            <div className="space-y-4 mt-3">
              <div>
                <span className="text-[11px] text-wise-muted uppercase tracking-wider block mb-1.5">Navigation Goals</span>
                <ul className="b-list">
                  {packet.careGoals.map((g, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft leading-normal">
                      <span className="dot" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[11px] text-wise-muted uppercase tracking-wider block mb-1.5 font-semibold text-wise-teal-deep">Preparatory Materials</span>
                <ul className="b-list">
                  {packet.materialsToPrepare.map((m, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft leading-normal">
                      <span className="num-dot bg-wise-teal-soft text-wise-teal-deep font-semibold font-mono">✓</span>
                      <span className="mt-0.5">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Questions and Insurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Questions to Ask */}
          <PremiumCard variant="standard" title="Questions for the Clinician">
            <ul className="space-y-2.5 mt-3">
              {packet.questionsToAskProvider.map((q, i) => (
                <li key={i} className="text-xs text-wise-fg-soft flex items-start gap-2 leading-relaxed bg-wise-surface-sunk p-2.5 border border-wise-hairline rounded-lg">
                  <span className="font-bold text-wise-teal-deep shrink-0">Q:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>

          {/* Insurance notes */}
          <PremiumCard variant="standard" title="Coverage & Billing Notes">
            <ul className="space-y-3 mt-3">
              {packet.insurancePaymentNotes.map((note, i) => (
                <li key={i} className="text-xs text-wise-fg-soft flex items-start gap-2.5 leading-relaxed">
                  <span className="num-dot bg-wise-teal-soft text-wise-teal-deep shrink-0 mt-0.5 font-semibold">i</span>
                  <span className="mt-0.5 leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </div>

        {/* Copy template email section */}
        <PremiumCard 
          variant="standard" 
          kicker="Outreach Template" 
          title="Pre-written message to clinicians"
          action={
            <button
              onClick={() => copyToClipboard(packet.suggestedOutreachMessage, 'message')}
              className="btn btn-ghost btn-sm text-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-wise-muted" />
              <span>Copy template</span>
            </button>
          }
        >
          <textarea
            readOnly
            className="input font-mono text-xs p-4 bg-wise-surface-sunk border border-wise-border rounded-xl w-full min-h-[120px] focus:ring-0 leading-relaxed cursor-text mt-3"
            value={packet.suggestedOutreachMessage}
          />
        </PremiumCard>

        {/* Next Steps */}
        <PremiumCard variant="standard" title="Preparation Checklist">
          <ActionChecklist 
            items={packet.nextStepChecklist}
            initialCheckedIndices={[0]} // check first item as completed by default
            className="mt-3"
          />
        </PremiumCard>

        {/* Safety reminders using Notice component */}
        <Notice variant="warn" title="Consent & Privacy Notice">
          <p className="text-[13px] leading-relaxed">
            We recommend confirming detail accuracy before sharing. Sharing this packet is entirely optional. Wise Care does not automatically send any medical details to third parties.
          </p>
          <p className="text-[12px] text-wise-muted-2 mt-1.5">
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </p>
        </Notice>

      </div>
    </AppShell>
  );
}
