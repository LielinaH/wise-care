'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Inbox, Settings, Users, Clock, Info, ArrowRight } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

export default function ProviderDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [accepting, setAccepting] = useState(true);

  useEffect(() => {
    // Seed and load referrals
    const stored = storage.getReferrals();
    if (stored.length > 0) {
      setReferrals(stored);
    } else {
      setReferrals(MOCK_REFERRALS);
      storage.setReferrals(MOCK_REFERRALS);
    }
  }, []);

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const acceptedCount = referrals.filter(r => r.status === 'accepted').length;

  return (
    <AppShell 
      title="Dashboard" 
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
                <span className="kicker">Welcome back · Quietford Counseling</span>
                <h2>You have <span style={{ color: 'var(--teal-deep)' }}>{pendingCount} new referrals</span> this week.</h2>
                <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '50ch', lineHeight: 1.55 }}>
                  Three are routine, two are flagged as warming up. The matching agent prefers your practice for sleep + anxiety. Average response time across providers is 1.4 days.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge teal"><span className="dot"></span>Profile · Listings live</span>
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
                <div className="sub text-wise-muted text-xs">Sorted by urgency. Privacy: providers see only what the user shared.</div>
              </div>
              <Link href="/provider/inbox" className="btn btn-quiet btn-sm flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              {referrals.slice(0, 4).map((r) => {
                const riskClass = r.risk === 'medium' ? 'warn' : r.risk === 'high' ? 'danger' : 'success';
                return (
                  <div key={r.id} className="ref-row">
                    <span className="ref-id">{r.id.toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {r.route} · {r.insurance}
                      </div>
                    </div>
                    <span className={`badge ${riskClass}`}>{r.risk.toUpperCase()} RISK</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                      {r.received}
                    </span>
                  </div>
                );
              })}
              {referrals.length === 0 && (
                <div className="py-6 text-center text-xs text-wise-muted italic">
                  No referrals in queue.
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
                className={`av-toggle ${accepting ? 'on' : ''}`}
                onClick={() => setAccepting(!accepting)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="label">Accepting new clients</div>
                  <div style={{ fontSize: '12px', color: accepting ? 'oklch(38% 0.11 158)' : 'var(--muted)', marginTop: '2px' }}>
                    {accepting ? '3 evening slots open this week' : 'No open slots listed'}
                  </div>
                </div>
                <span className="switch"></span>
              </div>
              <Link href="/provider/register" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Edit availability
              </Link>
            </div>

            {/* KPI Counts */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Last 30 days
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display">{acceptedCount + 12}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Accepted</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'oklch(48% 0.13 78)' }}>4</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Waitlist</div>
                </div>
                <div>
                  <div className="kpi-value num text-xl font-bold font-display" style={{ color: 'var(--muted)' }}>3</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Declined</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
                Average response time <strong style={{ color: 'var(--fg)' }}>1.4 days</strong> · Network avg 1.8
              </div>
            </div>

            {/* Profile Health */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Profile health
              </h4>
              <ul className="b-list">
                <li>
                  <span className="dot" style={{ background: 'oklch(56% 0.11 158)' }}></span>
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>License verified</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Approved recently</div>
                  </div>
                </li>
                <li>
                  <span className="dot" style={{ background: 'oklch(56% 0.11 158)' }}></span>
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Specialty tags up to date</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>6 specialties</div>
                  </div>
                </li>
                <li>
                  <span className="dot" style={{ background: 'oklch(70% 0.13 78)' }}></span>
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Add a practice photo</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Optional (improves match perception)</div>
                  </div>
                </li>
              </ul>
              <Link href="/provider/register" className="btn btn-ghost btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>
                Open profile
              </Link>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="notice">
          <Info className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
          <div>
            <strong style={{ color: 'var(--fg)' }}>Privacy reminder.</strong> Wise Care matches users to your practice based on the criteria you set. Users see your published profile. You only see what users chose to share when they sent a referral.
            <div className="text-[12px] text-wise-muted mt-2">
              For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
