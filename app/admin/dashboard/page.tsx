'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { ShieldAlert, Award, AlertTriangle, Users } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';

const INITIAL_PENDING = [
  { id: 'pp-301', name: 'Marin Telehealth Group', license: 'LCSW · CA #LCS24011', specialty: 'Anxiety, Trauma', insurance: 'Private Plan A, Private Plan B, Self-pay', state: 'CA', submitted: '11 hrs ago' },
  { id: 'pp-302', name: 'Dr. R. — Psychiatry', license: 'MD · NY #ML87302', specialty: 'Mood, ADHD', insurance: 'Private Plan B, Marketplace Plan', state: 'NY', submitted: '1 day ago' },
  { id: 'pp-303', name: 'Westbrook Counseling', license: 'LMFT · OR #LMF21998', specialty: 'Relationships, Burnout', insurance: 'Sliding scale, Self-pay', state: 'OR', submitted: '2 days ago' },
];

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const stored = storage.getStorageItem<any[]>('wisecare.pendingProviders', []);
    if (stored.length > 0) {
      setPending(stored);
    } else {
      setPending(INITIAL_PENDING);
      storage.setStorageItem('wisecare.pendingProviders', INITIAL_PENDING);
    }
  }, []);

  return (
    <AppShell title="Admin Operations" crumbs={['Operations', 'Dashboard']}>
      <div className="enter-stagger space-y-6">
        
        {/* Welcome panel */}
        <PremiumCard
          variant="bezel"
          kicker="Operations Console"
          title="Hi Admin — systems are normal."
          sub={
            <span className="text-xs text-wise-fg-soft mt-1 leading-normal max-w-[50ch] block">
              The provider verification queue has {pending.length} applications awaiting credentials check. Safety flags represent 2.3% of search volume.
            </span>
          }
          action={
            <Link href="/admin/verify" className="btn btn-primary btn-sm flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              Verification Queue ({pending.length})
            </Link>
          }
        >
          <div className="h-2" />
        </PremiumCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Directory Health" value="98.4%" />
          <StatCard label="Safety Audits" value="2 Crisis" className="text-wise-danger" />
          <StatCard label="Referrals Total" value={142} />
          <StatCard label="Match Success" value="84.5%" />
        </div>

        {/* main grid content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* pending list */}
          <PremiumCard
            variant="standard"
            title="Credential verification queue"
            sub="Clinicians awaiting directory listing."
            action={
              <Link href="/admin/verify" className="btn btn-quiet btn-sm text-xs font-semibold">
                See all verify queue →
              </Link>
            }
          >
            <div className="divide-y divide-wise-hairline mt-4">
              {pending.map((p) => (
                <div key={p.id} className="py-3 flex items-start gap-4 hover:bg-wise-surface-2 p-2 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wise-teal-soft to-wise-blue-soft text-wise-teal-deep flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-wise-teal-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-wise-fg">{p.name}</span>
                      <span className="font-mono text-[10px] text-wise-muted">{p.submitted}</span>
                    </div>
                    <p className="text-xs text-wise-fg-soft mt-0.5">{p.license}</p>
                    <p className="text-[11px] text-wise-muted mt-1 leading-normal italic line-clamp-1">
                      State: {p.state} · Focus: {p.specialty}
                    </p>
                  </div>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="py-8 text-center text-xs text-wise-muted italic">
                  Verification queue is empty. All credentials verified!
                </div>
              )}
            </div>
          </PremiumCard>

          {/* safety monitor */}
          <PremiumCard
            variant="standard"
            title="High-risk routing monitor"
            sub="Security & escalation checks."
          >
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-wise-danger-soft border border-wise-danger/15 rounded-xl text-xs text-wise-danger flex gap-3">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-wise-danger mt-0.5 animate-pulse" />
                <div>
                  <span className="font-semibold block">Safety Alert Log:</span>
                  <p className="opacity-90 leading-relaxed mt-0.5">
                    Triggered 988 Crisis Hotline routing recommendations for CA state searches on 2026-05-30.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono text-wise-muted block uppercase">Barriers Metrics</span>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-wise-fg-soft mb-1">
                      <span>Cost / Insurance Coverage</span>
                      <span className="font-semibold">42%</span>
                    </div>
                    <div className="h-1.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                      <div className="h-full bg-wise-teal" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-wise-fg-soft mb-1">
                      <span>Wait Times / Backlog</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="h-1.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                      <div className="h-full bg-wise-teal" style={{ width: '28%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-wise-fg-soft mb-1">
                      <span>Scheduling Constraints</span>
                      <span className="font-semibold">18%</span>
                    </div>
                    <div className="h-1.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                      <div className="h-full bg-wise-teal" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>
              </div>
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
