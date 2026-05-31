'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Check, MailOpen, UserMinus, ShieldAlert, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function ProviderInbox() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = storage.getReferrals();
    if (stored.length > 0) {
      setReferrals(stored);
    } else {
      setReferrals(MOCK_REFERRALS);
      storage.setReferrals(MOCK_REFERRALS);
    }
    setLoading(false);
  }, []);

  const handleAction = (id: string, action: 'accepted' | 'declined' | 'waitlisted') => {
    const updated = referrals.map(ref => {
      if (ref.id === id) {
        return { ...ref, status: action };
      }
      return ref;
    });

    setReferrals(updated);
    storage.setReferrals(updated);

    const actionText = action === 'accepted' ? 'Accepted referral' : action === 'declined' ? 'Declined referral' : 'Added referral to Waitlist';
    showToast(`${actionText} for referral request ${id}.`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const riskBadgeClass = (risk: string) => {
    if (risk === 'crisis') return 'danger';
    if (risk === 'high' || risk === 'medium') return 'warn';
    return 'success';
  };

  if (loading) {
    return (
      <AppShell title="Referral Inbox" crumbs={['Practice', 'Inbox']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-wise-teal spin" />
          <p className="text-sm text-wise-muted">Loading referral inbox queue...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Referral Inbox" crumbs={['Practice', 'Inbox']} actions={
      <Link href="/provider/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
    }>
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="enter-stagger space-y-6">
        
        {/* Intro */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Structured Referral Requests</h2>
          <p className="text-xs text-wise-muted mt-1 leading-relaxed">
            Review anonymized summaries and customized intake forms securely forwarded through the Wise Care portal. 
            All clinical intake briefing parameters are generated based on client checks.
          </p>
        </div>

        {/* Referrals List */}
        <div className="space-y-4">
          {referrals.map((ref) => {
            const status = ref.status || 'pending';
            return (
              <div 
                key={ref.id} 
                className={`card bg-wise-surface border rounded-2xl p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-start justify-between gap-5 ${
                  status === 'accepted' ? 'border-wise-success/20 bg-gradient-to-b from-wise-surface to-wise-success-soft/10' :
                  status === 'declined' ? 'border-wise-danger/10 opacity-70' :
                  status === 'waitlisted' ? 'border-wise-warn/20 bg-gradient-to-b from-wise-surface to-wise-warn-soft/10' :
                  'border-wise-hairline'
                }`}
              >
                
                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge font-mono text-[10px] uppercase font-semibold text-wise-fg">{ref.id}</span>
                    <span className="badge font-mono text-[10px] uppercase">{ref.received}</span>
                    <span className="badge font-mono text-[10px] uppercase">{ref.insurance}</span>
                    <span className={`badge ${riskBadgeClass(ref.risk)} font-mono text-[10px] uppercase`}>{ref.risk} risk</span>
                    
                    <span className={`badge ml-auto md:ml-0 capitalize ${
                      status === 'accepted' ? 'success' : status === 'declined' ? 'danger' : 'warn'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-wise-fg">{ref.name}</h3>
                    <p className="text-xs text-wise-muted-2 font-mono mt-0.5">Route: {ref.route} · Age: {ref.age}</p>
                  </div>

                  <div className="p-3.5 bg-wise-surface-2 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft leading-relaxed font-mono">
                    <span className="font-semibold text-wise-teal-deep text-[10.5px] uppercase tracking-wider block mb-1">Shared Intake Brief:</span>
                    "{ref.summary}"
                  </div>
                </div>

                {/* Actions column */}
                <div className="shrink-0 flex md:flex-col justify-end md:justify-start gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-wise-border md:w-44">
                  {status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(ref.id, 'accepted')}
                        className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
                        type="button"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(ref.id, 'waitlisted')}
                        className="btn btn-ghost btn-sm w-full flex items-center justify-center gap-1.5"
                        type="button"
                      >
                        <Clock className="w-3.5 h-3.5 text-wise-muted" />
                        Waitlist
                      </button>
                      <button
                        onClick={() => handleAction(ref.id, 'declined')}
                        className="btn btn-danger btn-sm w-full flex items-center justify-center gap-1.5"
                        type="button"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-wise-danger" />
                        Decline
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        const updated = referrals.map(item => item.id === ref.id ? { ...item, status: 'pending' } : item);
                        setReferrals(updated as Referral[]);
                        storage.setReferrals(updated as Referral[]);
                      }}
                      className="btn btn-ghost btn-sm w-full flex items-center justify-center gap-1.5"
                      type="button"
                    >
                      <Clock className="w-3.5 h-3.5 text-wise-muted" />
                      Reset to Pending
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}

interface ClockProps extends React.SVGProps<SVGSVGElement> {}
function Clock(props: ClockProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
