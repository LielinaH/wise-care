'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { BarChart, Lock, Info, Activity, Users, Clock, AlertCircle } from 'lucide-react';

export default function OrgInsights() {
  return (
    <AppShell title="Anonymous Trends" crumbs={['Insights', 'Aggregate Metrics']}>
      <div className="enter-stagger space-y-6">
        
        {/* Privacy Lock Banner */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm flex gap-4 items-start">
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

        {/* Stats Strip */}
        <div className="status-strip grid grid-cols-2 md:grid-cols-4 bg-wise-surface border border-wise-hairline rounded-xl overflow-hidden shadow-sm">
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Total Covered Members</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">1,240</div>
            <div className="meta text-xs text-wise-muted mt-1">Eligible population size</div>
          </div>
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Engagement Rate</div>
            <div className="v text-[16px] font-semibold mt-1.5 num text-wise-teal-deep">14.2%</div>
            <div className="meta text-xs text-wise-muted mt-1">Intake usage completed</div>
          </div>
          <div className="status-cell p-4.5 border-r border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Average Next Step Time</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">4.2 Days</div>
            <div className="meta text-xs text-wise-muted mt-1">From intake to match selection</div>
          </div>
          <div className="status-cell p-4.5">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Referrals Completed</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">78%</div>
            <div className="meta text-xs text-wise-muted mt-1">Connection closure rate</div>
          </div>
        </div>

        {/* Grid diagrams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Access Barriers */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-semibold">Common access barriers</h3>
              <div className="sub text-xs text-wise-muted mt-0.5">Top reasons hindering care connection.</div>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Out-of-pocket costs / Deductibles</span>
                  <span className="font-mono">45%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '45%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Wait times / Clinician availability</span>
                  <span className="font-mono">25%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Stigma / Anxiety regarding starting</span>
                  <span className="font-mono">15%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Geographic limits / Telehealth access</span>
                  <span className="font-mono">10%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Care Route Distribution */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-semibold">Care route distribution</h3>
              <div className="sub text-xs text-wise-muted mt-0.5">Aggregate split of suggested support paths.</div>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Individual Outpatient Therapy</span>
                  <span className="font-mono">58%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Psychiatric Medication Evaluation</span>
                  <span className="font-mono">20%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Peer Support Groups</span>
                  <span className="font-mono">12%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wise-fg-soft mb-1 font-medium">
                  <span>Community Mental Health Clinics</span>
                  <span className="font-mono">10%</span>
                </div>
                <div className="h-2.5 bg-wise-surface-sunk rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-blue" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support demand trends */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-semibold">Primary support demands</h3>
            <div className="sub text-xs text-wise-muted mt-0.5">Aggregate split of reported focus areas.</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Anxiety & Worry Focus</span>
              <span className="text-2xl text-wise-fg-soft font-display font-semibold mt-1">45%</span>
            </div>
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Work Stress & Burnout</span>
              <span className="text-2xl text-wise-fg-soft font-display font-semibold mt-1">35%</span>
            </div>
            <div className="p-4 bg-wise-surface-2 border border-wise-hairline rounded-xl flex flex-col justify-between h-24">
              <span className="text-wise-muted block">Sleep Disruption</span>
              <span className="text-2xl text-wise-fg-soft font-display font-semibold mt-1">20%</span>
            </div>
          </div>
        </div>

        {/* Notice Info */}
        <div className="notice flex items-start gap-3 bg-wise-surface-2 border border-wise-hairline rounded-xl p-4 text-[13px]">
          <Info className="w-5 h-5 text-wise-muted shrink-0 mt-0.5" />
          <div className="text-wise-fg-soft leading-normal">
            <strong>Audit Transparency Notice:</strong> Metrics are updated on daily intervals. Wise Care operates under HIPAA-compliant safeguards protecting individual records from organizational review.
          </div>
        </div>

      </div>
    </AppShell>
  );
}
