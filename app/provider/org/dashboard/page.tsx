'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { ProviderOrgProfile } from '@/lib/firebase/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Inbox, Settings, Users, Clock, Info, ArrowRight, Loader2, Building } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

function OrgProviderDashboardContent() {
  const { currentUser, isFirebaseMode } = useAuth();
  const [profile, setProfile] = useState<ProviderOrgProfile | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [accepting, setAccepting] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          const orgProfile = await firestoreHelpers.getProviderOrgProfile(currentUser.uid);
          if (orgProfile) {
            setProfile(orgProfile);
            setAccepting(orgProfile.availability !== 'No availability');
          }
          
          const refs = await firestoreHelpers.getReferralsForProvider(currentUser.uid);
          const activeRefs = refs.filter(r => r.status !== 'withdrawn');
          setReferrals(activeRefs);
        } catch (e) {
          console.error("Error loading org provider dashboard data: ", e);
        }
      } else {
        // Local fallback
        const storedRefs = storage.getReferrals();
        const activeRefs = storedRefs.filter(r => r.status !== 'withdrawn');
        setReferrals(activeRefs.length > 0 ? activeRefs : MOCK_REFERRALS);
        
        // Mock org profile
        setProfile({
          orgId: currentUser.uid,
          ownerUserId: currentUser.uid,
          organizationName: 'Quietford Counseling Collective',
          organizationType: 'group_practice',
          verificationStatus: 'verified',
          services: ['Psychological Counseling', 'Therapy Group'],
          specialties: ['Anxiety', 'Sleep'],
          modalities: ['Telehealth', 'In-person'],
          coverageOptions: ['Private Plan A', 'BCBS'],
          locations: ['California'],
          availability: 'Accepting new clients',
          createdAt: null,
          updatedAt: null,
        });
      }
      setLoading(false);
    }

    loadDashboardData();
  }, [currentUser, isFirebaseMode]);

  const handleAvailabilityToggle = async () => {
    if (!currentUser || !profile) return;
    const nextState = !accepting;
    setAccepting(nextState);
    
    const nextAvailabilityString = nextState ? 'Accepting new clients' : 'No availability';

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setProviderOrgProfile(currentUser.uid, {
          availability: nextAvailabilityString
        });
      } catch (e) {
        console.error("Error updating availability in Firestore:", e);
      }
    } else {
      const updatedProfile = { ...profile, availability: nextAvailabilityString };
      setProfile(updatedProfile);
    }
  };

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const acceptedCount = referrals.filter(r => r.status === 'accepted').length;

  if (loading) {
    return (
      <AppShell title="Clinic Administration" crumbs={['Practice', 'Dashboard']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading clinic workspace...</p>
        </div>
      </AppShell>
    );
  }

  const riskClass = (risk: string) => {
    if (risk === 'crisis' || risk === 'high') return 'danger';
    if (risk === 'moderate' || risk === 'medium') return 'warn';
    return 'success';
  };

  return (
    <AppShell 
      title="Clinic Administration" 
      crumbs={['Practice', 'Dashboard']} 
      actions={
        <div className="flex gap-2">
          <Link href="/organization/insights" className="btn btn-ghost btn-sm text-xs font-semibold">
            Analytics Insights
          </Link>
          <Link href="/provider/inbox" className="btn btn-primary btn-sm">
            Referral inbox<span className="inner">{pendingCount} <ArrowRight className="w-3 h-3" /></span>
          </Link>
        </div>
      }
    >
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span className="kicker">Welcome back · Clinic Organization</span>
                <h2>{profile?.organizationName}</h2>
                <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '50ch', lineHeight: 1.55 }}>
                  Manage collective intake queues, view credential approval checkpoints, and accept patient referrals into your group directory slots.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge teal">
                  <span className="dot"></span>
                  {profile?.verificationStatus === 'verified' ? 'Clinic Verified' : 'Awaiting Administration Approval'}
                </span>
                <Link href="/provider/inbox" className="btn btn-primary">
                  Open referral inbox<span className="inner">{pendingCount} new <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dash-grid">
          {/* Left Card: Recent Referrals */}
          <div className="card">
            <div className="card-head mb-4 flex justify-between items-center">
              <div>
                <h3 className="h3">Recent referrals</h3>
                <div className="sub text-wise-muted text-xs">Sorted by arrival. Providers only see shared Care Packets.</div>
              </div>
              <Link href="/provider/inbox" className="btn btn-quiet btn-sm flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              {referrals.slice(0, 4).map((r) => {
                const dateText = r.createdAt && r.createdAt.seconds 
                  ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
                  : (r.received || 'Just now');
                return (
                  <div key={r.referralId || r.id} className="ref-row">
                    <span className="ref-id">{(r.referralId || r.id).substring(0, 6).toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.patientDisplayName || r.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {r.route || 'Clinic Intake'} · {r.insurance || 'Public Coverage'}
                      </div>
                    </div>
                    <span className={`badge ${riskClass(r.risk || 'low')}`}>
                      {(r.risk || 'LOW').toUpperCase()} RISK
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                      {dateText}
                    </span>
                  </div>
                );
              })}
              {referrals.length === 0 && (
                <div className="py-8 text-center text-xs text-wise-muted italic">
                  No active referrals in queue.
                </div>
              )}
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="stack" style={{ '--gap': '16px' } as React.CSSProperties}>
            {/* Availability */}
            <div className="availability-card">
              <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Clinic Listings Status
              </h4>
              <div 
                className={`av-toggle ${accepting ? 'on' : ''}`}
                onClick={handleAvailabilityToggle}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="label">Open for intake matches</div>
                  <div style={{ fontSize: '12px', color: accepting ? 'oklch(38% 0.11 158)' : 'var(--muted)', marginTop: '2px' }}>
                    {accepting ? ' clinic accepting referrals' : 'Group matching paused'}
                  </div>
                </div>
                <span className="switch"></span>
              </div>
              <Link href="/provider/org/register" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Edit clinic details
              </Link>
            </div>

            {/* KPI Counts */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Operational stats
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display">{acceptedCount}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Accepted</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'oklch(48% 0.13 78)' }}>
                    {referrals.filter(r => r.status === 'waitlisted').length}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Waitlist</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'var(--muted)' }}>
                    {referrals.filter(r => r.status === 'declined').length}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Declined</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
                Response rate average: <strong style={{ color: 'var(--fg)' }}>1.6 days</strong>
              </div>
            </div>

            {/* Clinic Details card */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Organization details
              </h4>
              <ul className="b-list">
                <li>
                  <Building className="w-[18px] h-[18px] text-wise-teal shrink-0 mt-0.5" />
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Type: {profile?.organizationType}</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Clinicians and group therapies matched under collective licenses.
                    </div>
                  </div>
                </li>
              </ul>
              <Link href="/provider/org/register" className="btn btn-ghost btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>
                Open registration settings
              </Link>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="notice">
          <Info className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
          <div>
            <strong style={{ color: 'var(--fg)' }}>Privacy reminder.</strong> This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not claim HIPAA compliance, perform real credential verification, or store production medical records.
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function OrgProviderDashboard() {
  return (
    <ProtectedRoute allowedRoles={['provider_org']}>
      <OrgProviderDashboardContent />
    </ProtectedRoute>
  );
}
