'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Referral } from '@/lib/types';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Inbox, Settings, Users, Clock, Info } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

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
        
        {/* Welcome panel */}
        <PremiumCard
          variant="bezel"
          kicker="Practice Status Panel"
          title="Hi Coordinator — profile is active."
          sub={
            <span className="text-xs text-wise-fg-soft mt-1 leading-normal max-w-[50ch] block">
              Your community profile is listed and visible in CA searches. You have {pendingCount} new structured referral packets waiting in your inbox.
            </span>
          }
          action={
            <div className="flex gap-2.5 shrink-0">
              <Link href="/provider/inbox" className="btn btn-primary btn-sm flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-white" />
                Referral inbox ({pendingCount})
              </Link>
              <Link href="/provider/register" className="btn btn-ghost btn-sm">
                Edit Profile
              </Link>
            </div>
          }
        >
          <div className="h-2" />
        </PremiumCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={34} />
          <StatCard label="Referrals Pending" value={pendingCount} className="text-wise-teal-deep" />
          <StatCard label="Admitted (Demo)" value={acceptedCount} />
          <StatCard label="Profile Health" value="95%" />
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Recent referrals */}
          <PremiumCard
            variant="standard"
            title="Recent referrals in queue"
            sub="Review details and match statistics."
            action={
              <Link href="/provider/inbox" className="btn btn-quiet btn-sm text-xs font-semibold">
                See all inbox →
              </Link>
            }
          >
            <div className="divide-y divide-wise-hairline mt-4">
              {referrals.slice(0, 3).map((ref) => (
                <div key={ref.id} className="py-3 flex items-start gap-4 hover:bg-wise-surface-2 p-2 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wise-teal-soft to-wise-blue-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-wise-teal-deep" />
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
                  <Badge 
                    variant={
                      ref.status === 'accepted' ? 'success' : 
                      ref.status === 'declined' ? 'danger' : 
                      ref.status === 'waitlisted' ? 'warn' : 'standard'
                    }
                    showDot={true}
                    className="shrink-0 ml-2 capitalize"
                  >
                    {ref.status || 'pending'}
                  </Badge>
                </div>
              ))}
              {referrals.length === 0 && (
                <div className="py-6 text-center text-xs text-wise-muted italic">
                  No referrals in queue.
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Quick Actions */}
          <PremiumCard
            variant="standard"
            title="Quick Actions"
            sub="Directory management shortcuts."
          >
            <div className="space-y-3 mt-4">
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
          </PremiumCard>
        </div>

        {/* Prototype Disclaimer */}
        <Notice variant="standard">
          For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
        </Notice>

      </div>
    </AppShell>
  );
}
