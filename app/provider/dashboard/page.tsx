'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Stethoscope, Inbox, Settings, Users, Check, Clock, UserCheck } from 'lucide-react';

export default function ProviderDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);

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
    <AppShell title="Provider Dashboard" crumbs={['Practice', 'Dashboard']}>
      <div className="enter-stagger space-y-6">
        
        {/* welcome panel */}
        <div className="welcome-card bezel border border-wise-hairline rounded-3xl bg-gradient-to-b from-wise-surface-2 to-wise-surface shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="kicker text-[10px]">Practice Status Panel</span>
              <h2 className="text-2xl font-display font-semibold tracking-tight text-wise-fg mt-1">
                Hi Coordinator — profile is active.
              </h2>
              <p className="text-xs text-wise-muted mt-1 leading-normal max-w-[50ch]">
                Your community profile is listed and visible in CA searches. You have {pendingCount} new structured referral packets waiting in your inbox.
              </p>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Link href="/provider/inbox" className="btn btn-primary btn-sm flex items-center gap-1">
                <Inbox className="w-3.5 h-3.5" />
                Referral inbox ({pendingCount})
              </Link>
              <Link href="/provider/register" className="btn btn-ghost btn-sm">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="status-strip grid grid-cols-2 md:grid-cols-4 bg-wise-surface border border-wise-hairline rounded-xl overflow-hidden shadow-sm">
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Total Patients</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">34</div>
            <div className="meta text-xs text-wise-muted mt-1">Active caseload</div>
          </div>
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Referrals Pending</div>
            <div className="v text-[16px] font-semibold mt-1.5 num text-wise-teal-deep">{pendingCount}</div>
            <div className="meta text-xs text-wise-muted mt-1">Requires review</div>
          </div>
          <div className="status-cell p-4.5 border-r border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Admitted (Demo)</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">{acceptedCount}</div>
            <div className="meta text-xs text-wise-muted mt-1">Accepted this session</div>
          </div>
          <div className="status-cell p-4.5">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Profile Health</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">95%</div>
            <div className="meta text-xs text-wise-muted mt-1">Completed settings</div>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Recent referrals */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <div className="card-head flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold">Recent referrals in queue</h3>
                <div className="sub text-xs text-wise-muted">Review details and match statistics.</div>
              </div>
              <Link href="/provider/inbox" className="btn btn-quiet btn-sm text-xs font-semibold">
                See all inbox →
              </Link>
            </div>

            <div className="divide-y divide-wise-hairline">
              {referrals.slice(0, 3).map((ref) => (
                <div key={ref.id} className="py-3 flex items-start gap-4 hover:bg-wise-surface-2 p-2 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wise-teal-soft to-wise-blue-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-wise-fg">{ref.name}</span>
                      <span className="font-mono text-[10px] text-wise-muted">{ref.received}</span>
                    </div>
                    <p className="text-xs text-wise-fg-soft mt-0.5 truncate">{ref.route}</p>
                    <p className="text-[11px] text-wise-muted mt-1 leading-normal italic line-clamp-1">
                      "{ref.summary}"
                    </p>
                  </div>
                  <span className={`badge ${ref.status === 'accepted' ? 'success' : ref.status === 'declined' ? 'danger' : 'warn'} shrink-0 ml-2`}>
                    {ref.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-semibold border-b border-wise-hairline pb-2">Quick Actions</h3>
            
            <Link href="/provider/register" className="flex items-center gap-3 p-3 bg-wise-surface-2 border border-wise-hairline hover:border-wise-border-2 rounded-xl text-xs font-medium text-wise-fg-soft hover:bg-wise-surface-sunk transition-all">
              <Settings className="w-4.5 h-4.5 text-wise-teal-deep shrink-0" />
              <div>
                <span className="block font-semibold">Manage Profile Directory</span>
                <span className="text-[11px] text-wise-muted block mt-0.5">Edit specialties and costs</span>
              </div>
            </Link>

            <Link href="/provider/inbox" className="flex items-center gap-3 p-3 bg-wise-surface-2 border border-wise-hairline hover:border-wise-border-2 rounded-xl text-xs font-medium text-wise-fg-soft hover:bg-wise-surface-sunk transition-all">
              <Inbox className="w-4.5 h-4.5 text-wise-teal-deep shrink-0" />
              <div>
                <span className="block font-semibold">Review Pending Referrals</span>
                <span className="text-[11px] text-wise-muted block mt-0.5">{pendingCount} packages awaiting verify</span>
              </div>
            </Link>

            <button 
              onClick={() => alert('Demo Settings: Practice status updated to: Accepting Waitlist')} 
              className="flex items-center gap-3 p-3 bg-wise-surface-2 border border-wise-hairline hover:border-wise-border-2 rounded-xl text-left text-xs font-medium text-wise-fg-soft hover:bg-wise-surface-sunk transition-all w-full"
              type="button"
            >
              <Clock className="w-4.5 h-4.5 text-wise-teal-deep shrink-0" />
              <div>
                <span className="block font-semibold">Toggle Directory Status</span>
                <span className="text-[11px] text-wise-muted block mt-0.5">Current: Accepting new patients</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
