'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Check, Info, AlertTriangle, Clock, X, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const INITIAL_PENDING = [
  { id: 'pp-301', name: 'Marin Telehealth Group', license: 'LCSW · CA #LCS24011', specialty: 'Anxiety, Trauma', insurance: 'Private Plan A, Private Plan B, Self-pay', state: 'CA', submitted: '11 hrs ago', telehealth: true, slidingScale: true },
  { id: 'pp-302', name: 'Dr. R. - Psychiatry', license: 'MD · NY #ML87302', specialty: 'Mood, ADHD', insurance: 'Private Plan B, Marketplace Plan', state: 'NY', submitted: '1 day ago', telehealth: true, slidingScale: false },
  { id: 'pp-303', name: 'Westbrook Counseling', license: 'LMFT · OR #LMF21998', specialty: 'Relationships, Burnout', insurance: 'Sliding scale, Self-pay', state: 'OR', submitted: '2 days ago', telehealth: false, slidingScale: true },
];

export default function AdminVerify() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Checklist state
  const [checks, setChecks] = useState<Record<string, boolean>>({
    license: true,
    state: true,
    insurance: false,
    specialty: true,
    references: false,
    photo: false
  });
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = storage.getStorageItem<any[]>('wisecare.pendingProviders', []);
    if (stored.length > 0) {
      setPending(stored);
      setSelectedId(stored[0].id);
    } else {
      setPending(INITIAL_PENDING);
      storage.setStorageItem('wisecare.pendingProviders', INITIAL_PENDING);
      if (INITIAL_PENDING.length > 0) {
        setSelectedId(INITIAL_PENDING[0].id);
      }
    }
    setLoading(false);
  }, []);

  const handleAction = (id: string, name: string, action: 'approved' | 'declined' | 'more-info' | 'hold') => {
    const updated = pending.filter(p => p.id !== id);
    setPending(updated);
    storage.setStorageItem('wisecare.pendingProviders', updated);

    // If there is another item, select it
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    } else {
      setSelectedId('');
    }

    if (action === 'approved') {
      showToast(`Provider approved · listing live`);
    } else if (action === 'declined') {
      showToast(`Application rejected`);
    } else if (action === 'more-info') {
      showToast(`Info request sent to provider`);
    } else {
      showToast(`Held for senior review`);
    }
  };

  const toggleCheck = (key: string) => {
    setChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const selectedProvider = pending.find(x => x.id === selectedId) || pending[0];

  if (loading) {
    return (
      <AppShell title="Provider verification" crumbs={['Operations', 'Verification']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Clock className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted">Loading verification queue...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Provider verification" 
      crumbs={['Operations', 'Verification']}
      actions={
        <Link href="/admin/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
      }
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Verification queue · {pending.length} pending</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Provider verification.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Review license, state, and basic profile completeness before a provider can appear in user matches.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center text-xs text-wise-muted italic bg-wise-surface border border-dashed border-wise-border rounded-2xl">
            All provider listing applications have been resolved. Verification queue is empty!
          </div>
        ) : (
          <div className="verify-grid">
            
            {/* Queue List (Left Column) */}
            <div className="queue">
              <div className="queue-head">
                <span>QUEUE · {pending.length}</span>
                <span>SLA: 2 BUSINESS DAYS</span>
              </div>
              <div className="divide-y divide-wise-hairline">
                {pending.map(pp => (
                  <div 
                    key={pp.id}
                    className={`q-item ${pp.id === selectedId ? 'selected' : ''}`}
                    onClick={() => setSelectedId(pp.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{pp.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{pp.submitted}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{pp.license}</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span className="badge">{pp.state}</span>
                      {pp.telehealth && <span className="badge">Telehealth</span>}
                      {pp.slidingScale && <span className="badge teal">Sliding scale</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Detail Card (Right Column) */}
            {selectedProvider && (
              <div>
                <div className="card">
                  <div className="card-head flex justify-between items-start mb-4">
                    <div>
                      <h3 className="h3">{selectedProvider.name}</h3>
                      <div className="sub text-wise-muted text-xs">
                        {selectedProvider.license} · {selectedProvider.state} · Submitted {selectedProvider.submitted}
                      </div>
                    </div>
                    <span className="badge warn"><span className="dot"></span>UNDER REVIEW</span>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-[14px] mb-[18px]">
                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Specialty</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{selectedProvider.specialty}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insurance accepted</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{selectedProvider.insurance}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Modality</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{selectedProvider.telehealth ? 'Telehealth' : 'In-person'}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Sliding scale</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{selectedProvider.slidingScale ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                    Verification checklist
                  </h4>
                  <div className="checklist">
                    {[
                      ['license', 'License number verified', 'Cross-checked against state board database'],
                      ['state', 'State of licensure confirmed', 'Active in good standing'],
                      ['insurance', 'Insurance panel verified', 'Confirm in-network panels for top 3 plans'],
                      ['specialty', 'Specialty claims reasonable', 'Matches license type and scope'],
                      ['references', 'Professional references', '2 of 2 received'],
                      ['photo', 'Profile photo (optional)', 'Not required for verification'],
                    ].map(([k, t, d]) => (
                      <div key={k} className="chk-item">
                        <div 
                          className={`box ${checks[k] ? 'checked' : ''} cursor-pointer`} 
                          onClick={() => toggleCheck(k)}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="body">
                          <strong>{t}</strong>
                          <span>{d}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Privacy note */}
                  <div className="notice flex gap-3.5 items-start mt-[18px]">
                    <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
                    <div>
                      <strong style={{ color: 'var(--fg)' }}>Privacy note.</strong> License and credentialing data are stored separately from public listings. Users only see specialty, modality, payment options, and approach.
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleAction(selectedProvider.id, selectedProvider.name, 'approved')} 
                      className="btn btn-primary"
                    >
                      Approve &amp; publish<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
                    </button>
                    <button 
                      onClick={() => handleAction(selectedProvider.id, selectedProvider.name, 'more-info')} 
                      className="btn btn-soft"
                    >
                      Request more info
                    </button>
                    <button 
                      onClick={() => handleAction(selectedProvider.id, selectedProvider.name, 'hold')} 
                      className="btn btn-ghost"
                    >
                      Hold for review
                    </button>
                    <button 
                      onClick={() => handleAction(selectedProvider.id, selectedProvider.name, 'declined')} 
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* Prototype Disclaimer */}
        <div className="mt-6">
          <Notice variant="standard">
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </Notice>
        </div>

      </div>
    </AppShell>
  );
}
