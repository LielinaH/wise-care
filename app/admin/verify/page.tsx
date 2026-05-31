'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Award, Check, X, ShieldCheck, Mail, Loader2 } from 'lucide-react';

const INITIAL_PENDING = [
  { id: 'pp-301', name: 'Marin Telehealth Group', license: 'LCSW · CA #LCS24011', specialty: 'Anxiety, Trauma', insurance: 'Private Plan A, Private Plan B, Self-pay', state: 'CA', submitted: '11 hrs ago' },
  { id: 'pp-302', name: 'Dr. R. — Psychiatry', license: 'MD · NY #ML87302', specialty: 'Mood, ADHD', insurance: 'Private Plan B, Marketplace Plan', state: 'NY', submitted: '1 day ago' },
  { id: 'pp-303', name: 'Westbrook Counseling', license: 'LMFT · OR #LMF21998', specialty: 'Relationships, Burnout', insurance: 'Sliding scale, Self-pay', state: 'OR', submitted: '2 days ago' },
];

export default function AdminVerify() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = storage.getStorageItem<any[]>('wisecare.pendingProviders', []);
    if (stored.length > 0) {
      setPending(stored);
    } else {
      setPending(INITIAL_PENDING);
      storage.setStorageItem('wisecare.pendingProviders', INITIAL_PENDING);
    }
    setLoading(false);
  }, []);

  const handleAction = (id: string, name: string, action: 'approved' | 'declined' | 'more-info') => {
    const updated = pending.filter(p => p.id !== id);
    setPending(updated);
    storage.setStorageItem('wisecare.pendingProviders', updated);

    // If approved, we could optionally append them to our active MOCK_PROVIDERS, simulating a live database!
    if (action === 'approved') {
      // Simulate directory addition
      showToast(`Approved ${name} credentials. Listing published.`);
    } else if (action === 'declined') {
      showToast(`Rejected listing application for ${name}.`);
    } else {
      showToast(`Sent request for more info to ${name}.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return (
      <AppShell title="Provider Verification" crumbs={['Operations', 'Verification']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-wise-teal spin" />
          <p className="text-sm text-wise-muted">Loading verification queue...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Provider Verification" crumbs={['Operations', 'Verification']} actions={
      <Link href="/admin/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
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
          <h2 className="text-lg font-semibold tracking-tight">Active Applications Queue</h2>
          <p className="text-xs text-wise-muted mt-1 leading-relaxed">
            Verify provider credentials, NPI registrations, and state licensing limits before listing their practice live for care matching.
          </p>
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-5">
              
              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge font-mono text-[10px] uppercase font-semibold text-wise-fg">{p.id}</span>
                  <span className="badge font-mono text-[10px] uppercase">{p.submitted}</span>
                  <span className="badge teal font-mono text-[10px] uppercase">State Scope: {p.state}</span>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-tight text-wise-fg">{p.name}</h3>
                  <p className="text-xs text-wise-muted-2 font-mono mt-0.5">{p.license}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-wise-hairline">
                  <div>
                    <span className="text-wise-muted block">Specialties Focus</span>
                    <span className="font-semibold text-wise-fg-soft">{p.specialty}</span>
                  </div>
                  <div>
                    <span className="text-wise-muted block">Insurances Supported</span>
                    <span className="font-semibold text-wise-fg-soft">{p.insurance}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex md:flex-col justify-end md:justify-start gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-wise-border md:w-44">
                <button
                  onClick={() => handleAction(p.id, p.name, 'approved')}
                  className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  Approve Application
                </button>
                <button
                  onClick={() => handleAction(p.id, p.name, 'more-info')}
                  className="btn btn-ghost btn-sm w-full flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <Mail className="w-3.5 h-3.5 text-wise-muted" />
                  Request Info
                </button>
                <button
                  onClick={() => handleAction(p.id, p.name, 'declined')}
                  className="btn btn-danger btn-sm w-full flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5 text-wise-danger" />
                  Reject Listing
                </button>
              </div>

            </div>
          ))}

          {pending.length === 0 && (
            <div className="p-12 text-center text-xs text-wise-muted italic bg-wise-surface border border-dashed border-wise-border rounded-2xl">
              All provider listing applications have been resolved. Verification queue is empty!
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
