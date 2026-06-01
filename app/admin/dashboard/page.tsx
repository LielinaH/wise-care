'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { ShieldAlert, Award, AlertTriangle, Users, Info, ChevronRight, Activity, ShieldAlert as AlertIcon, ArrowRight, Loader2 } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const INITIAL_PENDING = [
  { id: 'pp-301', name: 'Marin Telehealth Group', license: 'LCSW · CA #LCS24011', specialty: 'Anxiety, Trauma', insurance: 'Private Plan A, Private Plan B, Self-pay', state: 'CA', submitted: '11 hrs ago' },
  { id: 'pp-302', name: 'Dr. R. - Psychiatry', license: 'MD · NY #ML87302', specialty: 'Mood, ADHD', insurance: 'Private Plan B, Marketplace Plan', state: 'NY', submitted: '1 day ago' },
  { id: 'pp-303', name: 'Westbrook Counseling', license: 'LMFT · OR #LMF21998', specialty: 'Relationships, Burnout', insurance: 'Sliding scale, Self-pay', state: 'OR', submitted: '2 days ago' },
];

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';

function AdminDashboardContent() {
  const { currentUser, isFirebaseMode } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      if (isFirebaseMode) {
        await firestoreHelpers.seedDemoProviders();
        alert('Firestore seeded with deterministic demo providers successfully!');
      } else {
        alert('App is in local mock mode. Firebase is not configured.');
      }
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (isFirebaseMode) {
        try {
          const reqs = await firestoreHelpers.getVerificationRequests();
          const pendingReqs = reqs.filter(r => r.status === 'pending');
          const mapped = pendingReqs.map(r => ({
            id: r.requestId || '',
            name: `${r.providerType === 'solo_provider' ? 'Solo' : 'Org'} Clinic (${r.providerId.substring(0, 5)})`,
            license: `Submitter: ${r.submittedBy}`,
            specialty: r.notes || 'Awaiting credential review',
            insurance: 'Validation Request',
            state: 'CA',
            submitted: r.createdAt && r.createdAt.seconds 
              ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
              : 'Just now'
          }));
          setPending(mapped);
        } catch (e) {
          console.error("Error loading verification requests:", e);
        }
      } else {
        const stored = storage.getStorageItem<any[]>('wisecare.pendingProviders', []);
        if (stored.length > 0) {
          setPending(stored);
        } else {
          setPending(INITIAL_PENDING);
          storage.setStorageItem('wisecare.pendingProviders', INITIAL_PENDING);
        }
      }
    }

    loadData();
  }, [currentUser, isFirebaseMode]);

  const getInitials = (name: string) => {
    return name
      .split(/[ \-\u2014]+/)
      .slice(0, 2)
      .map(s => s[0])
      .join('')
      .toUpperCase();
  };

  return (
    <AppShell 
      title="Admin operations" 
      crumbs={['Operations', 'Dashboard']}
      actions={
        <Link href="/admin/verify" className="btn btn-primary btn-sm flex items-center gap-1">
          Verification queue <span className="inner">{pending.length} <ArrowRight className="w-3 h-3" /></span>
        </Link>
      }
    >
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Title block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">Operational oversight · last 7 days</span>
            <h2 className="h2" style={{ margin: '8px 0 4px' }}>Admin dashboard.</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
              We oversee directory quality, routing safety, and access barriers, never individual care.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge"><span className="dot" style={{ background: 'oklch(56% 0.11 158)' }}></span>Systems healthy</span>
            <button 
              className="btn btn-soft btn-sm flex items-center gap-1" 
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>Seeding...</span>
                </>
              ) : (
                '🌱 Seed Demo Providers'
              )}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Digest exported successfully (Simulation).')}>Export weekly digest</button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="kpi-row">
          <div className="kpi">
            <span className="kpi-label">Active users</span>
            <span className="kpi-value">1,284</span>
            <span className="kpi-delta">▲ 12% vs prior</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Referrals routed</span>
            <span className="kpi-value">387</span>
            <span className="kpi-delta">▲ 8% vs prior</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Matching success rate</span>
            <span className="kpi-value font-display font-semibold">71%</span>
            <span className="kpi-delta down">▼ 2 pts</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Median time-to-route</span>
            <span className="kpi-value">3.4<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}> min</span></span>
            <span className="kpi-delta">▼ 0.6 min</span>
          </div>
        </div>

        {/* First Panel Grid */}
        <div className="panel-grid">
          {/* Referral volume area-chart card */}
          <div className="card">
            <div className="card-head mb-4 flex justify-between items-center">
              <div>
                <h3 className="h3">Referral volume - last 14 days</h3>
                <div className="sub text-wise-muted text-xs">Routed referrals, by day. Dotted line marks system maintenance window.</div>
              </div>
              <select className="select" style={{ width: 'auto', fontSize: '13px', padding: '7px 12px' }} defaultValue="14">
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            
            <div className="area-chart mt-4">
              {[42, 38, 51, 55, 48, 62, 70, 58, 65, 72, 80, 68, 55, 75].map((v, i) => (
                <div key={i} className="bar" style={{ height: `${v}%` }}></div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
              {['MAY 18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', 'MAY 31'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* Provider verification queue preview card */}
          <div className="card">
            <div className="card-head mb-4 flex justify-between items-center">
              <div>
                <h3 className="h3">Provider verification queue</h3>
                <div className="sub text-wise-muted text-xs">{pending.length} pending. SLA: 2 business days.</div>
              </div>
              <Link href="/admin/verify" className="btn btn-quiet btn-sm flex items-center gap-1">
                Open queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-wise-hairline">
              {pending.map((p) => (
                <div key={p.id} className="verify-row py-3 hover:bg-wise-surface-2 transition-all duration-200">
                  <div className="vp-avatar">{getInitials(p.name)}</div>
                  <div className="flex-1 pl-3">
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{p.license} · {p.state}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{p.submitted}</span>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="py-8 text-center text-xs text-wise-muted italic">
                  Verification queue is empty. All credentials verified!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Panel Grid */}
        <div className="panel-grid">
          {/* Access Barriers */}
          <div className="card">
            <div className="card-head mb-4">
              <div>
                <h3 className="h3">Common access barriers - last 7 days</h3>
                <div className="sub text-wise-muted text-xs">What slows users between recommendation and first appointment.</div>
              </div>
            </div>
            <div className="bar-chart mt-4">
              <div className="bar-item">
                <span className="label">Provider availability</span>
                <div className="bar-rail warn"><div style={{ width: '82%' }}></div></div>
                <span className="num">82%</span>
              </div>
              <div className="bar-item">
                <span className="label">Insurance match</span>
                <div className="bar-rail warn"><div style={{ width: '64%' }}></div></div>
                <span className="num">64%</span>
              </div>
              <div className="bar-item">
                <span className="label">Cost</span>
                <div className="bar-rail"><div style={{ width: '41%' }}></div></div>
                <span className="num">41%</span>
              </div>
              <div className="bar-item">
                <span className="label">Uncertainty / next step</span>
                <div className="bar-rail"><div style={{ width: '38%' }}></div></div>
                <span className="num">38%</span>
              </div>
              <div className="bar-item">
                <span className="label">Urgency / wait time</span>
                <div className="bar-rail"><div style={{ width: '24%' }}></div></div>
                <span className="num">24%</span>
              </div>
              <div className="bar-item">
                <span className="label">Location</span>
                <div className="bar-rail"><div style={{ width: '11%' }}></div></div>
                <span className="num">11%</span>
              </div>
            </div>
          </div>

          {/* Right Column Stack panels */}
          <div className="stack" style={{ '--gap': '14px' } as React.CSSProperties}>
            {/* High risk routing monitor */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                High-risk routing monitor
              </h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span className="kpi-value text-2xl font-bold font-display" style={{ color: 'oklch(38% 0.11 158)' }}>100%</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>of safety flags routed to crisis support within &lt; 1 min</span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', paddingTop: '14px', borderTop: '1px solid var(--hairline)', marginTop: '10px' }}>
                Last flag: <strong style={{ color: 'var(--fg)' }}>12 min ago</strong> · Routed to 988 in 4 seconds · No clinical access without consent.
              </div>
            </div>

            {/* Resource directory health */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Resource directory health
              </h4>
              <ul className="b-list">
                <li>
                  <span className="dot" style={{ background: 'oklch(56% 0.11 158)' }}></span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px' }}>
                    <span>342 verified providers</span>
                    <span className="num" style={{ color: 'var(--muted)' }}>+5 this wk</span>
                  </div>
                </li>
                <li>
                  <span className="dot" style={{ background: 'oklch(70% 0.13 78)' }}></span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px' }}>
                    <span>11 stale listings</span>
                    <span className="num" style={{ color: 'var(--muted)' }}>to refresh</span>
                  </div>
                </li>
                <li>
                  <span className="dot" style={{ background: 'var(--danger)' }}></span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px' }}>
                    <span>2 reported availability errors</span>
                    <span className="num" style={{ color: 'var(--muted)' }}>user flag</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Flagged cases */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Flagged cases for review
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flag-row danger">
                  <AlertTriangle className="w-4 h-4 text-wise-danger shrink-0" />
                  <span><strong>Provider reported availability mismatch</strong> · Quietford · 1 user reroute</span>
                </div>
                <div className="flag-row">
                  <Info className="w-4 h-4 text-wise-warn shrink-0" />
                  <span><strong>Match score below threshold</strong> · 3 users in 24h · Recheck filters</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scope disclaimer */}
        <div className="notice flex gap-3.5 items-start">
          <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
          <div>
            <strong style={{ color: 'var(--fg)' }}>Admin scope reminder.</strong> Wise Care admin oversees directory health, system performance, and safety routing. Admins do not access individual user health information; that's restricted to providers, with user consent.
            <div className="text-[12px] text-wise-muted mt-2">
              This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not claim HIPAA compliance, perform real credential verification, or store production medical records.
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
