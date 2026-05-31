'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import { storage } from '@/lib/storage';
import { FollowUpResult, CareRouteResult } from '@/lib/types';
import { Check, Loader2, ClipboardList, Info, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const BLOCKER_OPTIONS = [
  { v: 'cost', l: 'Cost or insurance confusion', s: 'Rates are too high or insurance status is unclear' },
  { v: 'waitlist', l: 'Long wait times / waitlists', s: 'First opening is weeks or months away' },
  { v: 'anxiety', l: 'Anxiety about calling or starting', s: 'Feeling overwhelmed by the outreach process' },
  { v: 'availability', l: 'Schedule conflicts', s: 'No openings match my work/school hours' },
  { v: 'other', l: 'Something else', s: 'The provider was not a good fit or other reasons' },
];

export default function FollowUpPage() {
  const [careRoute, setCareRoute] = useState<CareRouteResult | null>(null);
  
  // Form state
  const [contacted, setContacted] = useState<boolean | null>(null);
  const [scheduled, setScheduled] = useState<boolean | null>(null);
  const [blocker, setBlocker] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FollowUpResult | null>(null);

  useEffect(() => {
    const route = storage.getCareRoute();
    setCareRoute(route);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactedProvider: contacted || false,
          scheduledAppointment: scheduled || false,
          blocker: blocker || 'none',
          careRoute: careRoute?.recommendedRoute || 'General Therapy',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        storage.setStorageItem('wisecare.followup', data);
      } else {
        throw new Error('Follow-up generation failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContacted(null);
    setScheduled(null);
    setBlocker('');
    setResult(null);
    storage.removeStorageItem('wisecare.followup');
  };

  return (
    <AppShell title="Follow-Up Check-in" crumbs={['Care', 'Follow-up']}>
      {result && <FallbackBanner isFallback={result.isFallback} />}

      <div className="max-w-[640px] mx-auto space-y-6">
        
        {/* Intro */}
        {!result && (
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <span className="kicker">Check-in Survey</span>
            <h2 className="text-lg font-semibold tracking-tight mt-1">Care Navigation Check-in</h2>
            <p className="text-xs text-wise-muted mt-1 leading-relaxed">
              Let us know how your care connection process is going. If you hit any roadblocks, AI agents will suggest adjustments to keep you moving forward.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-wise-teal spin" />
            <p className="text-sm text-wise-muted">AI is analyzing check-in and preparing adjustments...</p>
          </div>
        ) : result ? (
          // Output recommendations
          <div className="space-y-6 enter">
            <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="kicker">Adjusted Recommendation</span>
                <h2 className="text-lg font-semibold tracking-tight mt-1">{result.blockerSummary}</h2>
              </div>
              
              <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft leading-relaxed">
                <span className="font-semibold text-wise-teal-deep text-[10px] uppercase tracking-wider block mb-1">Recommended Adjustment:</span>
                <p>{result.recommendedAdjustment}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-wise-hairline">
                <span className="text-xs text-wise-muted block mb-1">Next Best Action Steps:</span>
                <ul className="space-y-2">
                  {result.nextBestActions.map((action, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-wise-fg-soft leading-relaxed font-semibold">
                      <ArrowRight className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4.5 bg-wise-teal-soft/10 border border-wise-teal/20 rounded-xl text-xs text-wise-teal-deep italic leading-relaxed">
                "{result.encouragement}"
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={handleReset} className="btn btn-ghost btn-sm text-xs font-semibold">
                Start new check-in
              </button>
              <Link href="/dashboard" className="btn btn-primary btn-sm text-xs font-semibold">
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          // Form input
          <form onSubmit={handleSubmit} className="space-y-6 enter">
            
            {/* Contacted */}
            <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold">1. Did you contact any matched provider?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setContacted(true); setScheduled(null); }}
                  className={`choice flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition-all ${
                    contacted === true ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                  }`}
                >
                  Yes, I reached out
                </button>
                <button
                  type="button"
                  onClick={() => { setContacted(false); setScheduled(null); }}
                  className={`choice flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition-all ${
                    contacted === false ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                  }`}
                >
                  No, not yet
                </button>
              </div>
            </div>

            {/* Scheduled */}
            {contacted === true && (
              <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3 enter">
                <h3 className="text-sm font-semibold">2. Did you schedule an appointment?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduled(true)}
                    className={`choice flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition-all ${
                      scheduled === true ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                    }`}
                  >
                    Yes, scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduled(false)}
                    className={`choice flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition-all ${
                      scheduled === false ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                    }`}
                  >
                    No, not scheduled
                  </button>
                </div>
              </div>
            )}

            {/* Blocker question */}
            {((contacted === false) || (scheduled === false)) && (
              <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-3 enter">
                <h3 className="text-sm font-semibold">What was the primary roadblock?</h3>
                <p className="text-xs text-wise-muted leading-relaxed">
                  We use your selection to adapt your recommendations dynamically.
                </p>
                <div className="choice-grid grid grid-cols-1 gap-2.5">
                  {BLOCKER_OPTIONS.map((o) => {
                    const isSelected = blocker === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setBlocker(o.v)}
                        className={`choice flex items-start gap-3 p-4 border rounded-xl transition-all ${
                          isSelected ? 'selected border-wise-teal bg-wise-teal-soft shadow-inner' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                        }`}
                      >
                        <span className={`check w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-wise-teal-deep bg-wise-teal-deep text-white' : 'border-wise-border-2 bg-wise-surface'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <div>
                          <div className="label text-sm font-semibold text-wise-fg">{o.l}</div>
                          <div className="sub text-xs text-wise-muted mt-1 leading-normal">{o.s}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={contacted === null || (contacted === true && scheduled === null) || ((contacted === false || scheduled === false) && !blocker)}
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit check-in
              </button>
            </div>
          </form>
        )}

        {/* Safety Disclaimer */}
        <div className="notice flex items-start gap-3 bg-wise-surface-2 border border-wise-hairline rounded-xl p-4 text-[13px]">
          <ShieldCheck className="w-5 h-5 text-wise-muted shrink-0 mt-0.5" />
          <div className="text-wise-fg-soft leading-normal">
            <strong>Security Reminder:</strong> Your follow-up responses are stored locally. They help refine care navigation and do not constitute electronic health records.
          </div>
        </div>

      </div>
    </AppShell>
  );
}
