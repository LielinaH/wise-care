'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import PremiumCard from '@/components/ui/PremiumCard';
import Notice from '@/components/ui/Notice';
import { storage } from '@/lib/storage';
import { FollowUpResult, CareRouteResult } from '@/lib/types';
import { Check, Loader2, ArrowRight, ArrowLeft, Sparkles, Info, AlertTriangle } from 'lucide-react';

const BLOCKER_OPTIONS = [
  { v: 'cost', l: 'Cost or insurance confusion', s: 'Rates are too high or insurance status is unclear' },
  { v: 'waitlist', l: 'Long wait times / waitlists', s: 'First opening is weeks or months away' },
  { v: 'anxiety', l: 'Anxiety about calling or starting', s: 'Feeling overwhelmed by the outreach process' },
  { v: 'availability', l: 'Schedule conflicts', s: 'No openings match my work/school hours' },
  { v: 'other', l: 'Something else', s: 'The provider was not a good fit or other reasons' },
];

const BARRIER_ADVICE: Record<string, { t: string; d: string; action: string; href: string }> = {
  'no-availability': {
    t: 'When availability is tight, broaden the net.',
    d: "We've added 4 community clinic and group support options to your matches. These usually have shorter waitlists. We've also flagged self-guided sleep practices you can start tonight.",
    action: 'View shorter-wait options',
    href: '/matching',
  },
  'cost': {
    t: "Cost shouldn't block a first step.",
    d: 'We can switch you to sliding-scale, EAP, or free community resources. The community clinic in your area offers sessions on a $40 sliding scale and accepts uninsured.',
    action: 'See affordable options',
    href: '/matching',
  },
  'insurance': {
    t: 'Insurance gaps are common, but there are good fallbacks.',
    d: "Three providers we surfaced accept self-pay sliding scale. We can also help draft a request to your insurer for an out-of-network exception, or surface in-network alternatives.",
    action: 'See self-pay options',
    href: '/matching',
  },
  'unsure': {
    t: 'Not sure where to start? Start small.',
    d: "Try a peer support group this week: it's free, low-pressure, and a helpful way to learn what kind of care feels right before committing to weekly therapy.",
    action: 'See peer support groups',
    href: '/matching',
  },
  'changed': {
    t: 'It is okay to step back.',
    d: "If you'd like to pause, we'll save your Care Packet quietly. You can pick this up any time. If anything shifts, we can also try a different care route, for example, self-guided support.",
    action: 'Pause care navigation',
    href: '/dashboard',
  },
  'worsening': {
    t: 'If symptoms are worsening, we want to move faster.',
    d: "We've prioritized providers with same-week availability and a community clinic that handles urgent intake calls. If your situation feels acute, please use crisis support.",
    action: 'See urgent options',
    href: '/matching',
  },
};

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';

function FollowUpPageContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();

  const [contacted, setContacted] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState<string | null>(null);
  const [barrier, setBarrier] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>('same');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (isFirebaseMode && currentUser) {
        try {
          const followups = await firestoreHelpers.getFollowUpsForPatient(currentUser.uid);
          if (followups.length > 0) {
            const last = followups[0];
            setContacted(last.contactedProvider ? 'yes' : 'no');
            setScheduled(last.scheduledAppointment ? 'yes' : 'no');
            setBarrier(last.blocker !== 'none' ? last.blocker : null);
          }
        } catch (e) {
          console.error("Error loading follow up:", e);
        }
      } else {
        const stored = localStorage.getItem('wisecare.followup');
        if (stored) {
          try {
            const state = JSON.parse(stored);
            if (state.contacted) setContacted(state.contacted);
            if (state.scheduled) setScheduled(state.scheduled);
            if (state.barrier) setBarrier(state.barrier);
            if (state.symptoms) setSymptoms(state.symptoms);
          } catch (e) {
            console.warn('Failed to parse cached follow up state', e);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser, isFirebaseMode]);

  const persist = (updatedState: any) => {
    localStorage.setItem('wisecare.followup', JSON.stringify({
      contacted,
      scheduled,
      barrier,
      symptoms,
      ...updatedState
    }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSave = async () => {
    if (isFirebaseMode && currentUser) {
      try {
        const profile = await firestoreHelpers.getPatientProfile(currentUser.uid);
        const referralId = profile?.activeReferralId || 'none';

        await firestoreHelpers.createFollowUp({
          patientId: currentUser.uid,
          referralId,
          contactedProvider: contacted === 'yes' || contacted === 'partial',
          scheduledAppointment: scheduled === 'yes',
          blocker: barrier || 'none',
          recommendedAdjustment: advice ? advice.t : 'Keep checking in',
          nextBestActions: advice ? [advice.action] : [],
          createdAt: null,
        });
        persist({});
      } catch (e) {
        console.error("Error saving follow-up: ", e);
      }
    } else {
      persist({});
    }
    showToast('Check-in saved!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 900);
  };

  const advice = barrier ? BARRIER_ADVICE[barrier] : null;

  return (
    <AppShell title="Follow-up check-in" crumbs={['Care', 'Follow-up']}>
      <div className="checkin-wrap enter">
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Follow-up · 1 week later</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>A quick check-in.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px', maxWidth: '60ch' }}>
            Did anything happen this week? There's no right answer: most people don't get past the first call on the first try.
          </p>
        </div>

        <div className="checkin-card">
          <div className="inner">
            
            <div className="q-block" style={{ marginTop: 0 }}>
              <div className="q-label">Did you contact the provider you sent a request to?</div>
              <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { v: 'yes', l: 'Yes, I reached out' },
                  { v: 'partial', l: 'Tried, no response yet' },
                  { v: 'no', l: 'Not yet' },
                ].map(o => (
                  <button 
                    key={o.v}
                    type="button"
                    onClick={() => { setContacted(o.v); persist({ contacted: o.v }); }}
                    className={`choice ${contacted === o.v ? 'selected' : ''}`} 
                    style={{ padding: '12px' }}
                  >
                    <span className="check"><Check className="w-3 h-3 text-white" /></span>
                    <div className="label" style={{ fontSize: '13.5px' }}>{o.l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="q-block">
              <div className="q-label">Were you able to schedule an appointment?</div>
              <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { v: 'yes', l: 'Yes, appointment scheduled' },
                  { v: 'waitlist', l: "I'm on a waitlist" },
                  { v: 'no', l: 'No appointment yet' },
                ].map(o => (
                  <button 
                    key={o.v}
                    type="button"
                    onClick={() => { setScheduled(o.v); persist({ scheduled: o.v }); }}
                    className={`choice ${scheduled === o.v ? 'selected' : ''}`} 
                    style={{ padding: '12px' }}
                  >
                    <span className="check"><Check className="w-3 h-3 text-white" /></span>
                    <div className="label" style={{ fontSize: '13.5px' }}>{o.l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="q-block">
              <div className="q-label">If something got in the way, what was it?</div>
              <div className="choice-grid">
                {[
                  { v: 'no-availability', l: 'No availability', s: 'Waitlists, no slots, scheduling conflicts' },
                  { v: 'cost', l: 'Cost', s: 'Out of pocket too high' },
                  { v: 'insurance', l: 'Insurance issue', s: 'Not in-network, claim issues' },
                  { v: 'unsure', l: 'Not sure what to do', s: 'Felt overwhelmed or stuck' },
                  { v: 'changed', l: 'Changed mind', s: 'Decided to pause or wait' },
                  { v: 'worsening', l: 'Worsening symptoms', s: 'Things feel harder than last week' },
                ].map(o => (
                  <button 
                    key={o.v}
                    type="button"
                    onClick={() => { setBarrier(o.v); persist({ barrier: o.v }); }}
                    className={`choice ${barrier === o.v ? 'selected' : ''}`}
                  >
                    <span className="check"><Check className="w-3 h-3 text-white" /></span>
                    <div>
                      <div className="label">{o.l}</div>
                      <div className="sub">{o.s}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="q-block">
              <div className="q-label">How have your symptoms been this week?</div>
              <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { v: 'better', l: '↑ Better' },
                  { v: 'same', l: '→ About the same' },
                  { v: 'worse', l: '↓ A bit worse' },
                  { v: 'much-worse', l: '↓↓ Much worse' },
                ].map(o => (
                  <button 
                    key={o.v}
                    type="button"
                    onClick={() => { setSymptoms(o.v); persist({ symptoms: o.v }); }}
                    className={`choice ${symptoms === o.v ? 'selected' : ''}`} 
                    style={{ padding: '12px' }}
                  >
                    <span className="check"><Check className="w-3 h-3 text-white" /></span>
                    <div className="label" style={{ fontSize: '13px' }}>{o.l}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Advice section */}
        {advice ? (
          <div className="suggest-card enter">
            <div className="ico">
              <Sparkles className="w-[18px] h-[18px]" />
            </div>
            <div style={{ flex: 1 }}>
              <span className="kicker">AI suggested next action</span>
              <h3 style={{ marginTop: '8px' }}>{advice.t}</h3>
              <p>{advice.d}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href={advice.href} className="btn btn-primary btn-sm">
                  {advice.action}<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
                </Link>
                <button 
                  onClick={() => showToast('Action plan updated')} 
                  className="btn btn-ghost btn-sm"
                >
                  Update action plan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="notice" style={{ fontSize: '13.5px' }}>
            <Info className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
            <div>
              Once you select a barrier (if any), we'll suggest a specific next action based on what got in the way. 
              There's no penalty for not having made progress; most people don't on the first try.
            </div>
          </div>
        )}



        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-ghost flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
          <button onClick={handleSave} className="btn btn-primary">
            Save check-in &amp; update plan<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
          </button>
        </div>

      </div>
    </AppShell>
  );
}

export default function FollowUpPage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <FollowUpPageContent />
    </ProtectedRoute>
  );
}
