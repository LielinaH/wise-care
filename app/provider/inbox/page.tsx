'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Check, Info, Lock, Clock, AlertTriangle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import ProviderChatPanel from '@/components/wise-care/ProviderChatPanel';
import SupportPlanEditor from '@/components/wise-care/SupportPlanEditor';

function ProviderInboxContent() {
  const { currentUser, role, isFirebaseMode } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('draft');
  const [selectedId, setSelectedId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'new' | 'high'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState(false);

  const loadInbox = async () => {
    if (!currentUser) return;

    if (isFirebaseMode) {
      try {
        let vStatus = 'draft';
        if (role === 'solo_provider') {
          const profile = await firestoreHelpers.getSoloProviderProfile(currentUser.uid);
          vStatus = profile?.verification?.verificationStatus || profile?.verificationStatus || 'draft';
        } else if (role === 'provider_org') {
          const profile = await firestoreHelpers.getProviderOrgProfile(currentUser.uid);
          vStatus = profile?.verification?.verificationStatus || profile?.verificationStatus || 'draft';
        }
        setVerificationStatus(vStatus);

        const refs = await firestoreHelpers.getReferralsForProvider(currentUser.uid);
        const activeRefs = refs.filter(r => r.status !== 'withdrawn');
        
        // Map to client schema
        const mapped = activeRefs.map(r => ({
          id: r.referralId || '',
          name: r.patientDisplayName || 'Member (Self)',
          route: `Therapy · ${r.providerType === 'solo_provider' ? 'Solo Clinician' : 'Clinic Group'}`,
          risk: 'low',
          age: 'Adult',
          received: r.createdAt && r.createdAt.seconds 
            ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
            : 'Just now',
          insurance: 'Coverage matched',
          summary: 'Care Packet shared',
          status: r.status,
          providerId: r.providerId,
          providerName: r.providerName,
          providerType: r.providerType,
          appointmentDate: r.appointmentDate,
          appointmentTimeSlot: r.appointmentTimeSlot,
          appointmentType: r.appointmentType,
          appointmentNotes: r.appointmentNotes,
          carePacketId: r.carePacketId,
          patientId: r.patientId,
        }));

        setReferrals(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (e) {
        console.error("Error loading referrals from Firestore:", e);
      }
    } else {
      setVerificationStatus('verified');
      const stored = storage.getReferrals();
      const activeRefs = stored.filter(r => r.status !== 'withdrawn');
      const list = activeRefs.length > 0 ? activeRefs : MOCK_REFERRALS;
      setReferrals(list);
      if (list.length > 0) {
        setSelectedId(list[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInbox();
  }, [currentUser, isFirebaseMode, role]);

  useEffect(() => {
    setEditingPlan(false);
  }, [selectedId]);

  const handleAction = async (id: string, action: 'accepted' | 'declined' | 'waitlisted' | 'info-requested') => {
    const nextStatus = action === 'info-requested' ? 'pending' : action;

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.updateReferralStatus(id, nextStatus as any);
        await loadInbox();
      } catch (e) {
        console.error("Error updating referral status in Firestore:", e);
      }
    } else {
      const updated = referrals.map(ref => {
        if (ref.id === id) {
          return { 
            ...ref, 
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            createdAt: ref.createdAt || new Date(Date.now() - 3600000 * 12).toISOString() // fallback to 12 hours ago if missing
          } as Referral;
        }
        return ref;
      });
      setReferrals(updated);
      storage.setReferrals(updated);
    }

    let actionText = '';
    if (action === 'accepted') actionText = 'Referral accepted · scheduling invite sent';
    else if (action === 'waitlisted') actionText = 'Added to waitlist · user notified';
    else if (action === 'info-requested') actionText = 'Info request sent';
    else if (action === 'declined') actionText = 'Referral declined · user re-routed to alternates';

    showToast(actionText);
  };

  const handleReset = async (id: string) => {
    if (isFirebaseMode) {
      try {
        await firestoreHelpers.updateReferralStatus(id, 'pending');
        await loadInbox();
      } catch (e) {
        console.error("Error resetting referral in Firestore:", e);
      }
    } else {
      const updated = referrals.map(ref => {
        if (ref.id === id) {
          return { ...ref, status: 'pending' as const };
        }
        return ref;
      });
      setReferrals(updated);
      storage.setReferrals(updated);
    }
    showToast('Referral status reset to pending.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredReferrals = referrals.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'new') return /hr|days|Today/.test(r.received || '') && !/7 days|14 days/.test(r.received || '');
    if (filter === 'high') return r.risk === 'high' || r.risk === 'medium';
    return true;
  });

  const selectedRef = referrals.find(x => x.id === selectedId) || referrals[0];

  if (loading) {
    return (
      <AppShell title="Referral inbox" crumbs={['Practice', 'Referrals']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Clock className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted">Loading referral inbox queue...</p>
        </div>
      </AppShell>
    );
  }

  if (verificationStatus !== 'verified') {
    return (
      <AppShell 
        title="Referral inbox" 
        crumbs={['Practice', 'Referrals']} 
        actions={
          <Link href="/provider/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
        }
      >
        <div className="max-w-[600px] mx-auto py-12 enter">
          <div className="card p-8 border border-wise-border bg-wise-surface shadow-xl rounded-2xl text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="h2 text-xl font-bold text-wise-fg">Inbox Locked</h2>
              <p className="text-sm text-wise-muted mt-2 leading-relaxed max-w-[45ch] mx-auto">
                {verificationStatus === 'draft' 
                  ? 'Your practice parameters are currently in Draft status. Complete your profile setup to submit your credentials for validation.'
                  : 'Your credentials verify request is currently pending administrator review. Clinical referrals and messaging inbox are locked until verification is complete.'}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/provider/dashboard" className="btn btn-soft">
                Go to Dashboard
              </Link>
              {verificationStatus === 'draft' && (
                <Link 
                  href={role === 'provider_org' ? '/provider/org/register' : '/provider/solo/register'} 
                  className="btn btn-primary"
                >
                  Complete Practice Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Referral inbox" 
      crumbs={['Practice', 'Referrals']} 
      actions={
        <Link href="/provider/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
      }
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2 transition-all duration-300">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Referral inbox</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Care Packets shared with your practice.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Privacy: you see only what each user chose to share. Accept, waitlist, decline, or request more information.
          </p>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-xs text-wise-muted italic bg-wise-surface border border-dashed border-wise-border rounded-2xl">
            No referrals found in inbox.
          </div>
        ) : (
          <div className="inbox-grid">
            {/* Inbox List (Left Column) */}
            <div className="inbox-list">
              <div className="inbox-filter">
                <button 
                  className={filter === 'all' ? 'active' : ''} 
                  onClick={() => setFilter('all')}
                >
                  ALL ({referrals.length})
                </button>
                <button 
                  className={filter === 'new' ? 'active' : ''} 
                  onClick={() => setFilter('new')}
                >
                  NEW
                </button>
                <button 
                  className={filter === 'high' ? 'active' : ''} 
                  onClick={() => setFilter('high')}
                >
                  URGENCY
                </button>
              </div>

              <div className="divide-y divide-wise-hairline">
                {filteredReferrals.map(ref => (
                  <div 
                    key={ref.id}
                    className={`inbox-item ${ref.id === selectedId ? 'selected' : ''}`} 
                    onClick={() => setSelectedId(ref.id)}
                  >
                    <div className="top">
                      <span className="name">{ref.name}</span>
                      <span className="time">{ref.received}</span>
                    </div>
                    <div className="route">{ref.route}</div>
                    <div className="row-meta">
                      <span className={`badge ${ref.risk === 'medium' ? 'warn' : ref.risk === 'high' ? 'danger' : 'success'}`}>
                        {ref.risk.toUpperCase()} RISK
                      </span>
                      <span className="badge">{ref.insurance}</span>
                      {ref.status && ref.status !== 'pending' && (
                        <span className={`badge ${ref.status === 'accepted' ? 'success' : ref.status === 'declined' ? 'danger' : 'warn'}`}>
                          {ref.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredReferrals.length === 0 && (
                  <div className="p-6 text-center text-xs text-wise-muted italic">
                    No referrals match this filter.
                  </div>
                )}
              </div>
            </div>

            {/* Detail Pane (Right Column) */}
            {selectedRef && (
              <div className="detail-pane">
                {editingPlan ? (
                  <SupportPlanEditor
                    referralId={selectedRef.id}
                    patientId={selectedRef.patientId || ''}
                    patientName={selectedRef.name}
                    providerId={currentUser?.uid || ''}
                    providerName={currentUser?.displayName || 'Provider'}
                    providerType={selectedRef.providerType || 'solo_provider'}
                    carePacketId={selectedRef.carePacketId || ''}
                    onClose={() => setEditingPlan(false)}
                  />
                ) : (
                  <div className="inner">
                    <div className="detail-head">
                    <div>
                      <span className="detail-id">{selectedRef.id.toUpperCase()} · CARE PACKET SHARED</span>
                      <div className="detail-name">{selectedRef.name}</div>
                      <div className="detail-sub">Care route: {selectedRef.route} · Insurance: {selectedRef.insurance}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className={`badge ${selectedRef.risk === 'medium' ? 'warn' : selectedRef.risk === 'high' ? 'danger' : 'success'}`}>
                        {selectedRef.risk.toUpperCase()} URGENCY
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                        RECEIVED {selectedRef.received?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="k">User shared</span>
                    <div className="v">{selectedRef.summary}</div>
                  </div>
                  
                  <div className="detail-section">
                    <span className="k">Main concerns</span>
                    <div className="v">
                      {selectedRef.risk === 'high' || selectedRef.risk === 'crisis' 
                        ? 'Severe anxiety with sleep disruption. Work stresses and feeling overwhelmed.'
                        : 'Anxiety with sleep disruption. Onset ~6 weeks. Concentration affected.'}
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="k">Care goals</span>
                    <div className="v">
                      Reduce daily worry intensity, improve sleep consistency, and learn coping techniques for stressful situations.
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="k">Safety check</span>
                    <div className="v">
                      {selectedRef.risk === 'high' || selectedRef.risk === 'crisis' ? (
                        <span className="badge danger">Potential safety warning flagged (mild/moderate)</span>
                      ) : (
                        <span className="badge success">No safety concerns reported</span>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="k">Practical fit</span>
                    <div className="v">Telehealth · {selectedRef.insurance} · Weekday evenings · Sliding scale OK</div>
                  </div>

                  <div className="detail-section">
                    <span className="k">Outreach message</span>
                    <div className="v" style={{ background: 'var(--surface-2)', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline)', fontSize: '13.5px', lineHeight: '1.6' }}>
                      "I'm looking to start weekly therapy for anxiety and sleep difficulty that have been ongoing for about six weeks. I'd prefer telehealth in the evenings. I've prepared a short care summary I can share. Are you taking new clients in the next two weeks?"
                    </div>
                  </div>

                  {/* Lock Alert */}
                  <div style={{ marginTop: '24px', padding: '16px 18px', background: 'var(--teal-soft)', border: '1px solid oklch(58% 0.085 195 / 0.22)', borderRadius: 'var(--r-md)', display: 'flex', gap: '12px', fontSize: '13px', color: 'oklch(32% 0.07 200)' }}>
                    <Lock className="w-4.5 h-4.5 text-wise-teal-deep shrink-0 mt-0.5" />
                    <span>
                      <strong style={{ color: 'var(--teal-deep)' }}>You see what the user chose to share.</strong> Their full intake is private. Wise Care does not transmit additional clinical data.
                    </span>
                  </div>

                  {/* Booked Appointment Section */}
                  {selectedRef.appointmentDate && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--teal-soft)', border: '1px solid oklch(58% 0.11 158 / 0.22)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ margin: '0', fontSize: '13px', color: 'var(--teal-deep)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
                        Intake Session Booked by Patient
                      </h4>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--fg)', marginTop: '4px' }}>
                        {selectedRef.appointmentDate} · {selectedRef.appointmentTimeSlot}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        Session Type: <strong>{selectedRef.appointmentType}</strong>
                      </div>
                      {selectedRef.appointmentNotes && (
                        <div style={{ marginTop: '8px', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-sm)', fontSize: '12.5px', color: 'var(--fg-soft)', fontStyle: 'italic' }}>
                          Patient Notes: "{selectedRef.appointmentNotes}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Action Panel */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                    {selectedRef.status && selectedRef.status !== 'pending' ? (
                      <div className="w-full flex items-center justify-between p-3.5 bg-wise-surface-2 border border-wise-hairline rounded-xl">
                        <span className="text-xs text-wise-fg-soft font-medium">
                          Current status for this referral: <span className="font-semibold capitalize text-wise-teal-deep">{selectedRef.status}</span>
                        </span>
                        <div className="flex gap-2 items-center">
                          {selectedRef.status === 'accepted' && (
                            <button
                              onClick={() => setEditingPlan(true)}
                              className="btn btn-soft btn-xs font-semibold py-1 px-2 flex items-center gap-1 border border-emerald-600/30"
                              style={{ height: '24px', fontSize: '11px', textTransform: 'none' }}
                            >
                              🛠️ Manage Support Plan
                            </button>
                          )}
                          <button
                            onClick={() => handleReset(selectedRef.id)}
                            className="btn btn-ghost btn-xs text-wise-muted hover:text-wise-fg"
                            style={{ height: '24px', fontSize: '11px' }}
                          >
                            Change Action
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction(selectedRef.id, 'accepted')} 
                          className="btn btn-primary"
                        >
                          Accept referral<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
                        </button>
                        <button 
                          onClick={() => handleAction(selectedRef.id, 'waitlisted')} 
                          className="btn btn-soft"
                        >
                          Add to waitlist
                        </button>
                        <button 
                          onClick={() => handleAction(selectedRef.id, 'info-requested')} 
                          className="btn btn-ghost"
                        >
                          Request more info
                        </button>
                        <button 
                          onClick={() => handleAction(selectedRef.id, 'declined')} 
                          className="btn btn-danger"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>

                  {/* Provider Secure Chat Panel (Firebase Mode Exclusive) */}
                  {selectedRef.status === 'accepted' && (
                    <div style={{ marginTop: '24px' }}>
                      {isFirebaseMode ? (
                        <ProviderChatPanel
                          referralId={selectedRef.id}
                          providerId={currentUser?.uid || ''}
                          providerName={currentUser?.displayName || 'Provider'}
                          patientName={selectedRef.name}
                          carePacketId={selectedRef.carePacketId}
                        />
                      ) : (
                        <div style={{ padding: '20px', border: '1px border-dashed var(--border)', borderRadius: 'var(--r-md)', backgroundColor: 'var(--surface-2)', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
                          Secure Messaging and AI Clinical Summarizer are exclusive to Firebase Mode. Please configure Firebase to enable real-time messaging.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
            )}
          </div>
        )}

        {/* Prototype Disclaimer */}
        <div className="mt-6">
          <Notice variant="standard">
            This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not claim HIPAA compliance, perform real credential verification, or store production medical records.
          </Notice>
        </div>
      </div>
    </AppShell>
  );
}

export default function ProviderInboxPage() {
  return (
    <ProtectedRoute allowedRoles={['solo_provider', 'provider_org']}>
      <ProviderInboxContent />
    </ProtectedRoute>
  );
}
