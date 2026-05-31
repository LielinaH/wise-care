'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { Lock, Info, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';
import Notice from '@/components/ui/Notice';

export default function OrgInsights() {
  return (
    <AppShell 
      title="Anonymous trends" 
      crumbs={['Insights', 'Anonymous trends']}
    >
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">Northstar University · Member benefits dashboard</span>
            <h2 className="h2" style={{ margin: '8px 0 4px' }}>Anonymous access trends.</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px' }}>
              An operational view of how members are using care navigation. Aggregated, never individualized.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="select" style={{ width: 'auto', fontSize: '13px', padding: '7px 12px' }} defaultValue="30">
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="quarter">Quarter</option>
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Insights exported (Simulation)')}>Export</button>
          </div>
        </div>

        {/* EAP Privacy Banner */}
        <div className="priv-banner">
          <div className="ico">
            <Lock className="w-5 h-5" />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Privacy by design: what you do and don't see here.</h4>
            <p>
              <strong>You see:</strong> aggregated trends (n ≥ 10), care route distribution, barrier signals, completion rates. <strong>You never see:</strong> individual member names, intake content, care packets, provider matches, or any personal health information.
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="kpi-row">
          <div className="kpi">
            <span className="kpi-label">Members using care navigation</span>
            <span className="kpi-value num">428</span>
            <span className="kpi-delta">▲ 18% vs prior 30</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Care routes completed</span>
            <span className="kpi-value num">312</span>
            <span className="kpi-delta">▲ 12%</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Avg. time to first appointment</span>
            <span className="kpi-value num">8.2<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}> days</span></span>
            <span className="kpi-delta">▼ 1.4 days</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Referral completion rate</span>
            <span className="kpi-value num">73%</span>
            <span className="kpi-delta font-semibold">▲ 4 pts</span>
          </div>
        </div>

        {/* Panel Grid 2 (Charts) */}
        <div className="panel-grid-2">
          {/* Care Route Distribution Donut */}
          <div className="card">
            <div className="card-head mb-4">
              <div>
                <h3 className="h3">Care route distribution</h3>
                <div className="sub text-wise-muted text-xs">How members are routed after intake. Aggregated only.</div>
              </div>
            </div>
            <div className="donut-row mt-4">
              <svg className="donut" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--surface-sunk)" strokeWidth="6"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="oklch(58% 0.085 195)" strokeWidth="6" strokeDasharray="44 56" strokeDashoffset="0" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="oklch(56% 0.10 240)" strokeWidth="6" strokeDasharray="22 78" strokeDashoffset="-44" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="oklch(46% 0.085 200)" strokeWidth="6" strokeDasharray="14 86" stroke-dashoffset="-66" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="oklch(70% 0.13 78)" strokeWidth="6" strokeDasharray="11 89" stroke-dashoffset="-80" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="oklch(50% 0.04 250)" strokeWidth="6" strokeDasharray="9 91" stroke-dashoffset="-91" transform="rotate(-90 21 21)"/>
                <text x="21" y="20" textAnchor="middle" fontSize="6" fill="var(--fg)" fontFamily="var(--font-display)" fontWeight="600" letterSpacing="-0.04em">312</text>
                <text x="21" y="26" textAnchor="middle" fontSize="2.6" fill="var(--muted)" fontFamily="var(--font-mono)" letterSpacing="0.05em">ROUTES</text>
              </svg>
              <div className="legend">
                <div className="legend-row">
                  <span className="swatch" style={{ background: 'oklch(58% 0.085 195)' }}></span>
                  <span className="label">Therapy / counseling</span>
                  <span className="num">44%</span>
                </div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: 'oklch(56% 0.10 240)' }}></span>
                  <span className="label">Community clinic</span>
                  <span className="num">22%</span>
                </div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: 'oklch(46% 0.085 200)' }}></span>
                  <span className="label">Support group</span>
                  <span className="num">14%</span>
                </div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: 'oklch(70% 0.13 78)' }}></span>
                  <span className="label">Medication evaluation</span>
                  <span className="num">11%</span>
                </div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: 'oklch(50% 0.04 250)' }}></span>
                  <span className="label">Self-guided support</span>
                  <span className="num">9%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Support Demand Line Chart */}
          <div className="card">
            <div className="card-head mb-4">
              <div>
                <h3 className="h3">Member support demand (6 months)</h3>
                <div className="sub text-wise-muted text-xs">Monthly intakes started. Aggregated cohort signal only.</div>
              </div>
            </div>
            <div className="line-chart mt-4">
              <svg viewBox="0 0 320 160" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(58% 0.085 195)" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="oklch(58% 0.085 195)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 130 L 53 110 L 107 92 L 160 78 L 213 60 L 267 48 L 320 32 L 320 160 L 0 160 Z" fill="url(#g1)"/>
                <path d="M0 130 L 53 110 L 107 92 L 160 78 L 213 60 L 267 48 L 320 32" fill="none" stroke="oklch(46% 0.085 200)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                {[
                  [0,130],[53,110],[107,92],[160,78],[213,60],[267,48],[320,32]
                ].map(([x,y], idx) => (
                  <circle key={idx} cx={x} cy={y} r="3" fill="oklch(46% 0.085 200)"/>
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, paddingTop: '12px', borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
              <span>DEC</span><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span>
            </div>
          </div>
        </div>

        {/* Common Access Barriers */}
        <div className="card">
          <div className="card-head mb-4">
            <div>
              <h3 className="h3">Common access barriers</h3>
              <div className="sub text-wise-muted text-xs">What's slowing members between recommendation and first appointment. Anonymous signal.</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="bar-h">
              <span className="label">Cost / out-of-pocket</span>
              <div className="bar-h-rail">
                <div style={{ width: '68%', background: 'linear-gradient(90deg, oklch(56% 0.13 78), oklch(70% 0.13 78))' }}></div>
              </div>
              <span className="num">68%</span>
            </div>
            <div className="bar-h">
              <span className="label">Wait time</span>
              <div className="bar-h-rail">
                <div style={{ width: '54%' }}></div>
              </div>
              <span className="num">54%</span>
            </div>
            <div className="bar-h">
              <span className="label">Insurance confusion</span>
              <div className="bar-h-rail">
                <div style={{ width: '47%' }}></div>
              </div>
              <span className="num">47%</span>
            </div>
            <div className="bar-h">
              <span className="label">Provider availability</span>
              <div className="bar-h-rail">
                <div style={{ width: '38%' }}></div>
              </div>
              <span className="num">38%</span>
            </div>
            <div className="bar-h">
              <span className="label">Uncertainty / next step</span>
              <div className="bar-h-rail">
                <div style={{ width: '28%' }}></div>
              </div>
              <span className="num">28%</span>
            </div>
            <div className="bar-h">
              <span className="label">Location / commute</span>
              <div className="bar-h-rail">
                <div style={{ width: '9%' }}></div>
              </div>
              <span className="num">9%</span>
            </div>
          </div>

          <div className="notice brand mt-[18px]">
            <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
            <div>
              <strong style={{ color: 'var(--teal-deep)' }}>What you can act on.</strong> Cost is the #1 barrier this quarter. Consider expanding the EAP session benefit from 6 → 10 visits, or adding a sliding-scale community clinic partnership. Both are common interventions when this signal is dominant.
            </div>
          </div>
        </div>

        {/* Panel Grid 2 (Outcomes & Safety Audit) */}
        <div className="panel-grid-2">
          {/* Connection Outcomes */}
          <div className="card">
            <div className="card-head mb-4">
              <div>
                <h3 className="h3">Connection request outcomes</h3>
                <div className="sub text-wise-muted text-xs">Last 90 days. Aggregated across providers.</div>
              </div>
            </div>
            <div className="bar-chart mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="bar-h">
                <span className="label">Appointment scheduled</span>
                <div className="bar-h-rail">
                  <div style={{ width: '73%', background: 'linear-gradient(90deg, oklch(38% 0.11 158), oklch(56% 0.11 158))' }}></div>
                </div>
                <span className="num">73%</span>
              </div>
              <div className="bar-h">
                <span className="label">Added to waitlist</span>
                <div className="bar-h-rail">
                  <div style={{ width: '14%' }}></div>
                </div>
                <span className="num">14%</span>
              </div>
              <div className="bar-h">
                <span className="label">Provider declined</span>
                <div className="bar-h-rail">
                  <div style={{ width: '8%', background: 'linear-gradient(90deg, oklch(60% 0.04 250), oklch(50% 0.04 250))' }}></div>
                </div>
                <span className="num">8%</span>
              </div>
              <div className="bar-h">
                <span className="label">No response in 7 days</span>
                <div className="bar-h-rail">
                  <div style={{ width: '5%', background: 'linear-gradient(90deg, oklch(58% 0.17 25), oklch(70% 0.15 25))' }}></div>
                </div>
                <span className="num">5%</span>
              </div>
            </div>
          </div>

          {/* Risk Routing Audit */}
          <div className="card">
            <div className="card-head mb-4">
              <div>
                <h3 className="h3">Risk routing audit</h3>
                <div className="sub text-wise-muted text-xs">System safety oversight only. No personal records.</div>
              </div>
            </div>
            <div className="flex flex-col gap-[14px] mt-4">
              <div style={{ padding: '14px', background: 'var(--success-soft)', border: '1px solid oklch(56% 0.11 158 / 0.24)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'oklch(28% 0.10 158)' }}>High-urgency routing</span>
                  <span className="badge success">100% within SLA</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'oklch(34% 0.10 158)', lineHeight: 1.5 }}>
                  All flagged intakes routed to crisis support within target window. Median 4 seconds.
                </div>
              </div>
              
              <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Crisis support usage</span>
                  <span className="badge">7 routed</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  Aggregate count of members routed to 988 or local crisis line. No individual data.
                </div>
              </div>

              <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Provider directory accuracy</span>
                  <span className="badge teal">96.2%</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  Availability and insurance accuracy across 342 verified providers, validated weekly.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Warnings / Privacy notice */}
        <div className="notice warn flex gap-3.5 items-start">
          <Info className="w-4.5 h-4.5 text-wise-warn shrink-0 mt-0.5" />
          <div>
            <strong>This dashboard never contains personal health information.</strong> Individual intake responses, care packets, and provider matches remain private to the member and the providers they explicitly choose to share with.
            <div className="text-[12px] text-wise-muted mt-2">
              For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
