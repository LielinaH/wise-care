'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import { storage } from '@/lib/storage';
import { CarePacket, CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  FileText, 
  Copy, 
  Check, 
  Send, 
  HelpCircle, 
  ClipboardList,
  AlertTriangle,
  FolderHeart,
  Loader2,
  Info
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
          <p className="text-sm text-wise-muted">AI is structuring your clinician briefing packet...</p>
        </div>
      </AppShell>
    );
  }

  if (!packet) return null;

  return (
    <AppShell title="Care Packet" crumbs={['Care', 'Care Packet']} actions={
      <div className="flex gap-2">
        <Link href="/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
        <Link href="/connection-request" className="btn btn-primary btn-sm flex items-center gap-1">
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

        {/* Introduction Panel */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Clinician-Ready Preparation Brief</h2>
              <p className="text-xs text-wise-muted mt-0.5 leading-relaxed">
                This document structures your check-in parameters into a summary you can present to clinical providers during your intake call, saving you from repeating paperwork.
              </p>
            </div>
          </div>
        </div>

        {/* Shareable Summary block */}
        <div className="card elevated bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="kicker">Shared Clinician Summary</span>
              <h3 className="text-sm font-semibold text-wise-fg mt-0.5">Briefing Overview</h3>
            </div>
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
          </div>

          <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl text-[13.5px] leading-relaxed text-wise-fg-soft font-mono italic">
            "{packet.shareableSummary}"
          </div>
        </div>

        {/* Checklist, Impact & Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Intake concerns */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Symptoms & Life Impacts</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-wise-muted block mb-1">Focus Areas</span>
                <div className="flex flex-wrap gap-1">
                  {packet.mainConcerns.map((c, i) => <span key={i} className="badge teal text-[10px]">{c}</span>)}
                </div>
              </div>
              <div>
                <span className="text-xs text-wise-muted block mb-1.5">Timeline Details</span>
                <p className="text-xs text-wise-fg-soft leading-relaxed bg-wise-surface-2 p-2.5 border border-wise-hairline rounded-lg">
                  {packet.timeline}
                </p>
              </div>
              <div>
                <span className="text-xs text-wise-muted block mb-1.5">Areas Impacted</span>
                <ul className="space-y-1.5">
                  {packet.dailyLifeImpact.map((item, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wise-teal-deep shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Client Goals & preparation */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Goals & Action checklists</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-wise-muted block mb-1.5">Navigation Goals</span>
                <ul className="space-y-1.5">
                  {packet.careGoals.map((g, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wise-teal shrink-0"></span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-xs text-wise-muted block mb-1.5">Preparatory Materials</span>
                <ul className="space-y-1.5">
                  {packet.materialsToPrepare.map((m, i) => (
                    <li key={i} className="text-xs text-wise-fg-soft flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-wise-teal shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Insurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Questions to Ask */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Questions for the Clinician</h3>
            <ul className="space-y-2.5">
              {packet.questionsToAskProvider.map((q, i) => (
                <li key={i} className="text-xs text-wise-fg-soft flex items-start gap-2 leading-relaxed bg-wise-surface-2 p-2 border border-wise-hairline rounded-lg">
                  <span className="font-bold text-wise-teal-deep shrink-0">Q:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Insurance notes */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Coverage & Billing Notes</h3>
            <ul className="space-y-2.5">
              {packet.insurancePaymentNotes.map((note, i) => (
                <li key={i} className="text-xs text-wise-fg-soft flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copy template email section */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="kicker">Outreach Template</span>
              <h3 className="text-sm font-semibold text-wise-fg mt-0.5">Pre-written message to clinicians</h3>
            </div>
            <button
              onClick={() => copyToClipboard(packet.suggestedOutreachMessage, 'message')}
              className="btn btn-ghost btn-sm text-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-wise-muted" />
              <span>Copy template</span>
            </button>
          </div>

          <textarea
            readOnly
            className="input font-mono text-xs p-4 bg-wise-surface-sunk border border-wise-border rounded-xl w-full min-h-[120px] focus:ring-0 leading-relaxed cursor-text"
            value={packet.suggestedOutreachMessage}
          />
        </div>

        {/* Next Steps */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Preparation Checklist</h3>
          <ul className="space-y-2">
            {packet.nextStepChecklist.map((step, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-wise-surface-2 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft">
                <div className="w-4.5 h-4.5 rounded border border-wise-border-2 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-wise-teal-deep" />
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety reminders */}
        <div className="notice warn flex items-start gap-3.5 bg-wise-warn-soft border border-wise-warn/20 rounded-xl p-4 text-[13px]">
          <AlertTriangle className="w-5 h-5 text-wise-warn shrink-0 mt-0.5" />
          <div className="text-wise-fg-soft leading-normal">
            <strong>Consent & Security:</strong> We recommend confirming detail accuracy before sharing. Sharing this packet is entirely optional. Wise Care does not automatically send any medical details to third parties without your clicking the Connect button.
          </div>
        </div>

      </div>
    </AppShell>
  );
}
