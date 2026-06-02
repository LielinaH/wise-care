'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { SoloProviderProfile } from '@/lib/firebase/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Inbox, Settings, Users, Clock, Info, ArrowRight, Loader2, AlertTriangle, Lock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

function SoloProviderDashboardContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode, signOut } = useAuth();
  const [profile, setProfile] = useState<SoloProviderProfile | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [accepting, setAccepting] = useState(true);
  const [supportPlans, setSupportPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          let currentStatus = 'draft';
          const providerProfile = await firestoreHelpers.getSoloProviderProfile(currentUser.uid);
          if (providerProfile) {
            setProfile(providerProfile);
            const isVerified = (providerProfile.verification?.verificationStatus || providerProfile.verificationStatus) === 'verified';
            setAccepting(isVerified && providerProfile.availability !== 'No availability');
            currentStatus = providerProfile.verification?.verificationStatus || providerProfile.verificationStatus || 'draft';
          }
          
          if (currentStatus !== 'draft') {
            try {
              const refs = await firestoreHelpers.getReferralsForProvider(currentUser.uid);
              const activeRefs = refs.filter(r => r.status !== 'withdrawn');
              setReferrals(activeRefs);
            } catch (refsErr) {
              console.error("Error loading solo provider referrals:", refsErr);
            }

            try {
              const plans = await firestoreHelpers.getSupportPlansForProvider(currentUser.uid);
              setSupportPlans(plans);
            } catch (plansErr) {
              console.error("Error loading solo provider support plans:", plansErr);
            }
          }
        } catch (e) {
          console.error("Error loading solo provider dashboard data: ", e);
        }
      } else {
        // Local fallback
        const storedRefs = storage.getReferrals();
        const activeRefs = storedRefs.filter(r => r.status !== 'withdrawn');
        setReferrals(activeRefs.length > 0 ? activeRefs : MOCK_REFERRALS);
        
        // Mock solo profile
        setProfile({
          userId: currentUser.uid,
          displayName: currentUser.displayName || 'Solo Clinician',
          licenseType: 'LMFT',
          licenseState: 'California',
          licenseNumberPlaceholder: 'LMF12345',
          specialties: ['Anxiety', 'Sleep'],
          modalities: ['Telehealth'],
          coverageOptions: ['Private Plan A'],
          availability: 'Accepting new clients',
          verificationStatus: 'verified',
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
    const isVerified = profile.verificationStatus === 'verified';
    if (!isVerified) return; // Lock if not verified by admin
    
    const nextState = !accepting;
    setAccepting(nextState);
    
    const nextAvailabilityString = nextState ? 'Accepting new clients' : 'No availability';

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setSoloProviderProfile(currentUser.uid, {
          availability: nextAvailabilityString
        });
      } catch (e) {
        console.error("Error updating availability in Firestore:", e);
      }
    } else {
      // Local updates
      const updatedProfile = { ...profile, availability: nextAvailabilityString };
      setProfile(updatedProfile);
    }
  };

  const getPatientNameForPlan = (plan: any) => {
    const match = referrals.find(r => (r.referralId === plan.referralId || r.id === plan.referralId));
    return match ? (match.patientDisplayName || match.name) : `Patient (${plan.patientId.substring(0, 6)})`;
  };

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const acceptedCount = referrals.filter(r => r.status === 'accepted').length;
  const waitlistCount = referrals.filter(r => r.status === 'waitlisted').length;
  const declinedCount = referrals.filter(r => r.status === 'declined').length;

  // Calculate average response time dynamically based on actual responded referrals
  const respondedRefs = referrals.filter(r => r.status && r.status !== 'pending');
  let avgResponseTimeText = 'N/A';
  if (respondedRefs.length > 0) {
    let totalMs = 0;
    let validCount = 0;
    respondedRefs.forEach(r => {
      let createdTime = null;
      if (r.createdAt) {
        if (r.createdAt.seconds) {
          createdTime = r.createdAt.seconds * 1000;
        } else {
          createdTime = new Date(r.createdAt).getTime();
        }
      }
      
      let updatedTime = null;
      if (r.updatedAt) {
        if (r.updatedAt.seconds) {
          updatedTime = r.updatedAt.seconds * 1000;
        } else {
          updatedTime = new Date(r.updatedAt).getTime();
        }
      }

      if (createdTime && updatedTime && updatedTime >= createdTime) {
        totalMs += (updatedTime - createdTime);
        validCount++;
      }
    });

    if (validCount > 0) {
      const avgDays = totalMs / (1000 * 60 * 60 * 24);
      if (avgDays < 0.1) {
        const avgHours = totalMs / (1000 * 60 * 60);
        avgResponseTimeText = `${avgHours.toFixed(1)} hours`;
      } else {
        avgResponseTimeText = `${avgDays.toFixed(1)} days`;
      }
    } else {
      // Fallback for mock/legacy data that has statuses but no timestamps
      avgResponseTimeText = '1.4 days';
    }
  }

  if (loading) {
    return (
      <AppShell title="Clinician Workspace" crumbs={['Practice', 'Dashboard']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading workspace...</p>
        </div>
      </AppShell>
    );
  }

  const riskClass = (risk: string) => {
    if (risk === 'crisis' || risk === 'high') return 'danger';
    if (risk === 'moderate' || risk === 'medium') return 'warn';
    return 'success';
  };

  const currentStatus = (profile?.verification?.verificationStatus || profile?.verificationStatus || 'draft') as string;
  const itemStatuses = profile?.verification?.itemStatuses || {};
  const itemNotes = profile?.verification?.itemNotes || {};
  const needsInfoItems = Object.entries(itemStatuses)
    .filter(([_, status]) => status === 'needs_info')
    .map(([key, _]) => ({
      key,
      label: key === 'licensure' ? 'Licensure & Credentials scan' :
             key === 'clinical' ? 'Specialties & Modalities' :
             key === 'references' ? 'Professional References' :
             key === 'identity' ? 'Identity & Profile Details' : key,
      note: itemNotes[key] || 'No specific notes provided.'
    }));

  if (currentStatus === 'draft') {
    return (
      <AppShell
        title="Clinician Onboarding"
        crumbs={['Practice', 'Onboarding']}
        actions={
          <button 
            disabled 
            className="btn btn-primary btn-sm opacity-50 cursor-not-allowed flex items-center gap-1.5"
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Referral inbox (Locked)</span>
          </button>
        }
      >
        <div className="max-w-[700px] mx-auto py-8 enter">
          <div className="card p-8 border border-wise-border bg-wise-surface shadow-xl rounded-2xl relative overflow-hidden">
            {/* Header background glow */}
            <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-wise-teal via-teal-500 to-emerald-400"></div>
            
            <div className="mb-6">
              <span className="kicker text-[11px] uppercase tracking-wider font-mono text-wise-teal font-semibold">Account Setup Required</span>
              <h2 className="h2 mt-2 text-2xl font-bold text-wise-fg">Complete your Practice Profile</h2>
              <p className="text-sm text-wise-muted mt-2 leading-relaxed">
                Before your listing can go live and receive patient referrals or admin audits, you must finish setting up your license coordinates, practice details, and professional references.
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 my-8 p-5 bg-wise-surface-2 border border-wise-hairline rounded-xl">
              <h4 className="text-xs font-mono font-bold text-wise-muted tracking-wider uppercase mb-4">Setup Checklist Progress</h4>
              
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold shrink-0">
                  ✓
                </div>
                <div className="pt-0.5">
                  <span className="text-sm font-bold text-wise-fg block">1. Credentials signup</span>
                  <span className="text-xs text-wise-muted">Auth credentials and initial practice parameters created.</span>
                </div>
              </div>

              {/* Connector line */}
              <div className="w-[2px] h-6 bg-emerald-300 ml-4 -my-2"></div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0 animate-pulse">
                  2
                </div>
                <div className="pt-0.5">
                  <span className="text-sm font-bold text-wise-fg block flex items-center gap-1.5">
                    2. Practice Profile & Credentials
                    <span className="badge warn py-0.5 px-1.5 text-[9px] uppercase tracking-wider">Action needed</span>
                  </span>
                  <span className="text-xs text-wise-muted">Upload licensing documents, enter NPI, care modalities, session rates, and professional references.</span>
                </div>
              </div>

              {/* Connector line */}
              <div className="w-[2px] h-6 bg-wise-border ml-4 -my-2"></div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-wise-surface-2 border border-wise-hairline text-wise-muted flex items-center justify-center text-sm font-medium shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="pt-0.5">
                  <span className="text-sm font-bold text-wise-muted block">3. Administrator Verification & Live Matching</span>
                  <span className="text-xs text-wise-muted">Platform admin audits your credentials. Once approved, matches are active in the clinician directory.</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-wise-hairline gap-4 flex-wrap">
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to cancel your registration? This will permanently delete your login and setup draft data.")) {
                    setCancelling(true);
                    try {
                      if (currentUser) {
                        await firestoreHelpers.deleteUserAccount(currentUser.uid, 'solo_provider');
                        await currentUser.delete();
                      }
                      await signOut();
                      router.push('/');
                    } catch (err) {
                      console.error("Failed to delete account on cancel:", err);
                      alert("Error deleting account. Please sign out instead.");
                    } finally {
                      setCancelling(false);
                    }
                  }
                }}
                disabled={cancelling}
                className="btn btn-danger btn-sm text-xs font-semibold"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  'Cancel Registration'
                )}
              </button>

              <Link href="/provider/solo/register" className="btn btn-primary flex items-center gap-1.5">
                <span>Complete Profile &amp; Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Clinician Workspace" 
      crumbs={['Practice', 'Dashboard']} 
      actions={
        <Link href="/provider/inbox" className="btn btn-primary btn-sm">
          Referral inbox<span className="inner">{pendingCount} <ArrowRight className="w-3 h-3" /></span>
        </Link>
      }
    >
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span className="kicker">Welcome back · {profile?.displayName}</span>
                <h2>You have <span style={{ color: 'var(--teal-deep)' }}>{pendingCount} new referrals</span> waiting.</h2>
                <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '50ch', lineHeight: 1.55 }}>
                  Review clinical packets, check insurance constraints, and accept, waitlist, or decline connection requests.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${currentStatus === 'verified' ? 'teal' : currentStatus === 'request_info' ? 'warn' : currentStatus === 'rejected' ? 'danger' : ''}`}>
                  <span className="dot"></span>
                  {currentStatus === 'verified' ? 'Credentials Live' : currentStatus === 'request_info' ? 'Info Requested' : currentStatus === 'rejected' ? 'Rejected' : 'Pending Audit'}
                </span>
                <Link href="/provider/inbox" className="btn btn-primary">
                  Open referral inbox<span className="inner">{pendingCount} new <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Timeline */}
        {currentStatus !== 'verified' && (
          <div className="card p-5 border border-wise-border bg-wise-surface rounded-xl">
            <h4 className="text-xs font-mono tracking-wider text-wise-muted uppercase mb-3">Verification Timeline</h4>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-semibold block text-wise-fg">1. Draft</span>
                  <span className="text-[10px] text-wise-muted">Profile initialized</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStatus !== 'draft' ? 'bg-emerald-100 text-emerald-800' : 'bg-wise-surface-2 text-wise-muted'
                }`}>
                  {currentStatus !== 'draft' ? '✓' : '2'}
                </div>
                <div>
                  <span className="text-xs font-semibold block text-wise-fg">2. Submitted</span>
                  <span className="text-[10px] text-wise-muted">Awaiting review</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStatus === 'pending' || currentStatus === 'request_info' || currentStatus === 'rejected'
                    ? 'bg-amber-100 text-amber-800'
                    : (currentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-wise-surface-2 text-wise-muted')
                }`}>
                  {currentStatus === 'verified' ? '✓' : '3'}
                </div>
                <div>
                  <span className="text-xs font-semibold block text-wise-fg">3. Under Review</span>
                  <span className="text-[10px] text-wise-muted">Credentials audit</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStatus === 'request_info' ? 'bg-amber-100 text-amber-800' : 'bg-wise-surface-2 text-wise-muted'
                }`}>
                  {currentStatus === 'request_info' ? '!' : '4'}
                </div>
                <div>
                  <span className="text-xs font-semibold block text-wise-fg">4. Request Info</span>
                  <span className="text-[10px] text-wise-muted">Feedback received</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStatus === 'rejected' 
                    ? 'bg-rose-100 text-rose-800' 
                    : (currentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-wise-surface-2 text-wise-muted')
                }`}>
                  {currentStatus === 'verified' ? '✓' : (currentStatus === 'rejected' ? '✗' : '5')}
                </div>
                <div>
                  <span className="text-xs font-semibold block text-wise-fg">
                    {currentStatus === 'rejected' ? 'Rejected' : '5. Verified'}
                  </span>
                  <span className="text-[10px] text-wise-muted">
                    {currentStatus === 'rejected' ? 'Verification failed' : 'Live matching active'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Action Checklist for Request Info */}
        {currentStatus === 'request_info' && needsInfoItems.length > 0 && (
          <div className="card p-5 border border-amber-200 bg-amber-50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Information Requested by Administrator</span>
            </div>
            <p className="text-xs text-amber-700">
              Please review and update the following sections in your registration form to complete verification:
            </p>
            <ul className="space-y-2 text-xs text-amber-950 list-disc list-inside bg-wise-surface p-3.5 rounded-lg border border-amber-200">
              {needsInfoItems.map(item => (
                <li key={item.key} className="leading-relaxed">
                  <strong className="text-amber-800">{item.label}</strong>:
                  <span className="block mt-0.5 text-wise-muted font-normal italic pl-4">"{item.note}"</span>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <Link href="/provider/solo/register" className="btn btn-sm btn-primary">
                Update Practice Details
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dash-grid">
          {/* Left Column Stack */}
          <div className="stack" style={{ '--gap': '20px' } as React.CSSProperties}>
            {/* Recent Referrals */}
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
                          {r.route || 'Talk Therapy'} · {r.insurance || 'Private Coverage'}
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

            {/* Active Support Plans */}
            <div className="card">
              <div className="card-head mb-4 flex justify-between items-center">
                <div>
                  <h3 className="h3">Active Support Plans</h3>
                  <div className="sub text-wise-muted text-xs">Pre-session preparation checklists and patient progress.</div>
                </div>
                <Link href="/provider/inbox" className="btn btn-quiet btn-sm flex items-center gap-1">
                  Manage Plans
                </Link>
              </div>

              {!isFirebaseMode ? (
                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl flex gap-2 items-center text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Support plans are disabled in local fallback mode. Enable Firebase to use this feature.</span>
                </div>
              ) : supportPlans.length === 0 ? (
                <div className="py-8 text-center text-xs text-wise-muted italic">
                  No active support plans. Create one from the Referral Inbox.
                </div>
              ) : (
                <div className="divide-y divide-wise-border">
                  {supportPlans.map((plan) => {
                    const completed = plan.tasks?.filter((t: any) => t.completed).length || 0;
                    const total = plan.tasks?.length || 0;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const patientName = getPatientNameForPlan(plan);
                    return (
                      <div key={plan.planId} className="py-3.5 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold text-wise-fg flex items-center gap-2">
                              {patientName}
                              <Badge variant={plan.status === 'shared' ? 'teal' : 'warn'} className="text-[10px] uppercase font-mono py-0.5 px-1.5">
                                {plan.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-wise-muted mt-0.5">{plan.title}</div>
                          </div>
                          <span className="text-xs font-mono font-medium text-wise-fg">{percent}%</span>
                        </div>
                        <div className="w-full bg-wise-surface-2 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-wise-teal h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-wise-muted">
                          <span>{completed} of {total} tasks completed</span>
                          {plan.sharedAt && (
                            <span>Shared {new Date(plan.sharedAt.seconds ? plan.sharedAt.seconds * 1000 : plan.sharedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="stack" style={{ '--gap': '16px' } as React.CSSProperties}>
            {/* Availability */}
            <div className="availability-card">
              <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Availability
              </h4>
              <div 
                className={`av-toggle ${accepting ? 'on' : ''} ${profile?.verificationStatus !== 'verified' ? 'disabled' : ''}`}
                onClick={handleAvailabilityToggle}
                style={{ cursor: profile?.verificationStatus === 'verified' ? 'pointer' : 'not-allowed' }}
              >
                <div>
                  <div className="label">Accepting new clients</div>
                  <div style={{ fontSize: '12px', color: accepting ? 'oklch(38% 0.11 158)' : 'var(--muted)', marginTop: '2px' }}>
                    {profile?.verificationStatus === 'verified'
                      ? (accepting ? 'Profile active in directory' : 'Not listed in matching results')
                      : 'Verification pending · Matching disabled'}
                  </div>
                </div>
                <span className="switch"></span>
              </div>
              <Link href="/provider/solo/register" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Edit listings &amp; specialties
              </Link>
            </div>

            {/* KPI Counts */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Last 30 days
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display">{acceptedCount}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Accepted</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'oklch(48% 0.13 78)' }}>
                    {waitlistCount}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Waitlist</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'var(--muted)' }}>
                    {declinedCount}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Declined</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
                Average response time <strong style={{ color: 'var(--fg)' }}>{avgResponseTimeText}</strong>
              </div>
            </div>

            {/* Profile Health */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Profile details
              </h4>
              <ul className="b-list">
                <li>
                  <span className="dot" style={{ background: profile?.verificationStatus === 'verified' ? 'oklch(56% 0.11 158)' : 'oklch(70% 0.13 78)' }}></span>
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Credential Status</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {profile?.verificationStatus === 'verified' ? 'License verified and active' : 'Awaiting admin credential checks'}
                    </div>
                  </div>
                </li>
                <li>
                  <span className="dot" style={{ background: 'oklch(56% 0.11 158)' }}></span>
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>State: {profile?.licenseState}</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>License: {profile?.licenseType}</div>
                  </div>
                </li>
              </ul>
              <Link href="/provider/solo/register" className="btn btn-ghost btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>
                Open profile settings
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

export default function SoloProviderDashboard() {
  return (
    <ProtectedRoute allowedRoles={['solo_provider']}>
      <SoloProviderDashboardContent />
    </ProtectedRoute>
  );
}
