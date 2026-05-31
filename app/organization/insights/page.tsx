'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { Lock } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import StatCard from '@/components/ui/StatCard';
import Notice from '@/components/ui/Notice';

export default function OrgInsights() {
  return (
    <AppShell title="Anonymous Trends" crumbs={['Insights', 'Aggregate Metrics']}>
      <div className="enter-stagger space-y-6">
        
        {/* Privacy Lock Banner */}
        <PremiumCard variant="bezel">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-wise-teal-deep" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Strict Privacy Compliance Enforcement</h2>
              <p className="text-xs text-wise-muted mt-0.5 leading-relaxed">
                Wise Care protects individual identities. Organizations see anonymous trends only. Individual details, check-in questionnaires, or specific clinic connections are never shown.
              </p>
            </div>
          </div>
        </PremiumCard>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Covered Members" value="1,240" />
          <StatCard label="Engagement Rate" value="14.2%" className="text-wise-teal-deep" />
          <StatCard label="Average Next Step Time" value="4.2 Days" />
          <StatCard label="Referrals Completed" value="78%" />
        </div>

        {/* Grid diagrams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Access Barriers */}
          <PremiumCard
            variant="standard"
            title="Common access barriers"
            sub="Top reasons hindering care connection."
          >
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Out-of-pocket costs / Deductibles</span>
                  <span className="font-mono">45%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '45%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Wait times / Clinician availability</span>
                  <span className="font-mono">25%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Stigma / Anxiety regarding starting</span>
                  <span className="font-mono">15%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Geographic limits / Telehealth access</span>
                  <span className="font-mono">10%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Care Route Distribution */}
          <PremiumCard
            variant="standard"
            title="Care route distribution"
            sub="Aggregate split of suggested support paths."
          >
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Individual Outpatient Therapy</span>
                  <span className="font-mono">58%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Psychiatric Medication Evaluation</span>
                  <span className="font-mono">20%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Peer Support Groups</span>
                  <span className="font-mono">12%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Community Mental Health Clinics</span>
                  <span className="font-mono">10%</span>
                </div>
                <div className="h-2 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Support demand trends */}
        <PremiumCard
          variant="standard"
          title="Primary support demands"
          sub="Aggregate split of reported focus areas."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold mt-4">
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Anxiety & Worry Focus</span>
              <span className="text-2xl text-wise-fg font-display font-semibold mt-1">45%</span>
            </div>
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Work Stress & Burnout</span>
              <span className="text-2xl text-wise-fg font-display font-semibold mt-1">35%</span>
            </div>
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Sleep Disruption</span>
              <span className="text-2xl text-wise-fg font-display font-semibold mt-1">20%</span>
            </div>
          </div>
        </PremiumCard>

        {/* Prototype Disclaimer */}
        <Notice variant="standard">
          For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
        </Notice>

      </div>
    </AppShell>
  );
}
