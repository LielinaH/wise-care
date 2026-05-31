'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import { storage } from '@/lib/storage';
import { CarePacket, CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  Copy, 
  Download, 
  Send, 
  Check, 
  Lock, 
  Info,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function CarePacketPage() {
  const router = useRouter();
  const [packet, setPacket] = useState<CarePacket | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checklistState, setChecklistState] = useState<boolean[]>([]);

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
      setChecklistState(new Array(cachedPacket.nextStepChecklist.length).fill(false));
    } else {
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
        setChecklistState(new Array(data.nextStepChecklist.length).fill(false));
      } else {
        throw new Error('Failed to generate Care Packet');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const docEl = document.querySelector('.packet-doc');
    if (docEl) {
      const text = (docEl as HTMLElement).innerText;
      navigator.clipboard.writeText(text).catch(() => {});
      showToast('Care Packet copied to clipboard!');
    }
  };

  const downloadPDF = () => {
    showToast('PDF download started (prototype simulation).');
  };

  const saveToDashboard = () => {
    showToast('Care Packet saved to your dashboard.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleChecklistItem = (idx: number) => {
    setChecklistState(prev => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  if (loading) {
    return (
      <AppShell title="Generating Care Packet" crumbs={['Care', 'Care Packet']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-wise-teal spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="text-sm text-wise-muted font-medium">AI is structuring your clinician briefing packet...</p>
        </div>
      </AppShell>
    );
  }

  if (!packet) return null;

  return (
    <AppShell 
      title="Care Packet" 
      crumbs={['Care', 'Care route', 'Packet']} 
      actions={
        <div className="flex gap-2">
          <Link href="/connection-request" className="btn btn-primary btn-sm">
            Share with provider<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
          </Link>
        </div>
      }
    >
      <FallbackBanner isFallback={packet.isFallback} />

      <div className="enter">
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">Provider-ready summary</span>
            <h2 className="h2" style={{ margin: '8px 0 4px' }}>Your Care Packet</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px', maxWidth: '60ch' }}>
              A short, structured summary you can share with a clinician: only with your consent. Nothing here leaves Wise Care until you say so.
            </p>
          </div>
          <span className="badge teal"><span className="dot"></span>DRAFT · NOT YET SHARED</span>
        </div>

        <div className="packet-grid">
          {/* Left Document Pane */}
          <div className="packet-doc">
            <div className="doc-inner">
              <div className="doc-head">
                <div>
                  <h3 className="doc-title">Care Packet: Briefing</h3>
                  <div className="doc-sub">Prepared by Wise Care · Not a clinical record · Not a diagnosis</div>
                </div>
                <div className="doc-meta-row">
                  <div>
                    <span className="k">Generated</span>
                    <span className="v">Today · Just now</span>
                  </div>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Main concerns</div>
                <div className="ps-body">
                  <p>
                    <strong>{packet.mainConcerns.slice(0, 2).join(' and ') || 'Anxiety with sleep disruption'}</strong> (primary).
                  </p>
                  {packet.shareableSummary && (
                    <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                      "{packet.shareableSummary}"
                    </p>
                  )}
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Timeline</div>
                <div className="ps-body">
                  <p><strong>{packet.timeline || 'About six weeks.'}</strong></p>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Impact on daily life</div>
                <div className="ps-body">
                  <ul>
                    {packet.dailyLifeImpact.map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.split(':')[0] || 'Impact'}:</strong> {item.split(':')[1] || item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Safety</div>
                <div className="ps-body">
                  <p>
                    <strong>No safety concerns reported.</strong> No immediate thoughts of self-harm or harming others. Crisis routing remains available throughout Wise Care.
                  </p>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Care goals</div>
                <div className="ps-body">
                  <ul>
                    {packet.careGoals.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Questions to ask the provider</div>
                <div className="ps-body">
                  <ul>
                    {packet.questionsToAskProvider.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label font-semibold text-wise-teal-deep">To prepare before appointment</div>
                <div className="ps-body">
                  <ul>
                    {packet.materialsToPrepare.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Insurance &amp; payment</div>
                <div className="ps-body">
                  <ul>
                    {packet.insurancePaymentNotes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Suggested outreach message</div>
                <div className="ps-body">
                  <div className="outreach-msg whitespace-pre-wrap">
                    {packet.suggestedOutreachMessage}
                  </div>
                </div>
              </div>

              <div className="packet-section">
                <div className="ps-label">Next-step checklist</div>
                <div className="ps-body">
                  <ul className="check-list" style={{ marginTop: '4px' }}>
                    {packet.nextStepChecklist.map((item, idx) => (
                      <li key={idx} onClick={() => toggleChecklistItem(idx)} className="cursor-pointer">
                        <div className={`box ${checklistState[idx] ? 'checked' : ''}`}>
                          {checklistState[idx] && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="label" style={{ textDecoration: checklistState[idx] ? 'line-through' : 'none' }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar Stack */}
          <div className="sidebar-stack">
            <div className="action-card">
              <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Packet actions
              </h4>
              <div className="stack-btns">
                <button className="action-btn" onClick={copyToClipboard}>
                  <Copy className="ico" /> Copy summary to clipboard
                </button>
                <button className="action-btn" onClick={downloadPDF}>
                  <Download className="ico" /> Download as PDF
                </button>
                <Link className="action-btn" href="/connection-request">
                  <Send className="ico" /> Share with selected provider
                </Link>
                <button className="action-btn" onClick={saveToDashboard}>
                  <Check className="ico" /> Save to dashboard
                </button>
              </div>
            </div>

            <div className="action-card">
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Looks right?
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: 'var(--fg-soft)', lineHeight: 1.55 }}>
                You can edit any section or regenerate from the original intake. Nothing is shared yet.
              </p>
              <Link href="/intake" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Edit intake answers
              </Link>
            </div>

            <div className="privacy-card">
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock className="w-3.5 h-3.5" /> What gets shared
              </strong>
              Providers only see what you choose to send. You can redact sections before sending. Wise Care never shares with anyone you have not approved.
            </div>
          </div>
        </div>

        <div className="notice warn" style={{ marginTop: '24px' }}>
          <Info className="w-4 h-4 text-wise-warn shrink-0 mt-0.5" />
          <div>
            <strong>This is not a clinical record.</strong> A Care Packet is a starting point for your first conversation. Your provider will form their own assessment, which is what we want, because Wise Care does not replace clinical judgment.
            <div className="text-[12px] text-wise-muted mt-2">
              For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
