'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Lock, Info, AlertTriangle, ShieldCheck, BarChart3, HelpCircle, Clock, Check, XCircle } from 'lucide-react';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface LinePoint {
  label: string;
  value: number;
}

interface BarrierItem {
  label: string;
  value: number;
}

interface OutcomeItem {
  label: string;
  value: number;
  colorGrad: string;
}

interface RangeData {
  members: number;
  membersDelta: string;
  completedRoutes: number;
  completedRoutesDelta: string;
  avgTime: number;
  avgTimeDelta: string;
  completionRate: number;
  completionRateDelta: string;
  donutData: DonutSegment[];
  lineData: LinePoint[];
  barriers: BarrierItem[];
  outcomes: OutcomeItem[];
  safety: {
    urgencySla: string;
    crisisRouted: number;
    accuracy: number;
  };
}

const RANGE_DATA: Record<string, RangeData> = {
  '30': {
    members: 428,
    membersDelta: '▲ 18% vs prior 30d',
    completedRoutes: 312,
    completedRoutesDelta: '▲ 12%',
    avgTime: 8.2,
    avgTimeDelta: '▼ 1.4 days',
    completionRate: 73,
    completionRateDelta: '▲ 4 pts',
    donutData: [
      { label: 'Therapy / counseling', value: 44, color: 'oklch(58% 0.085 195)' },
      { label: 'Community clinic', value: 22, color: 'oklch(56% 0.10 240)' },
      { label: 'Support group', value: 14, color: 'oklch(46% 0.085 200)' },
      { label: 'Medication evaluation', value: 11, color: 'oklch(70% 0.13 78)' },
      { label: 'Self-guided support', value: 9, color: 'oklch(50% 0.04 250)' },
    ],
    lineData: [
      { label: 'DEC', value: 120 },
      { label: 'JAN', value: 150 },
      { label: 'FEB', value: 180 },
      { label: 'MAR', value: 220 },
      { label: 'APR', value: 280 },
      { label: 'MAY', value: 312 },
    ],
    barriers: [
      { label: 'Cost / out-of-pocket', value: 68 },
      { label: 'Wait time', value: 54 },
      { label: 'Insurance confusion', value: 47 },
      { label: 'Provider availability', value: 38 },
      { label: 'Uncertainty / next step', value: 28 },
      { label: 'Location / commute', value: 9 },
    ],
    outcomes: [
      { label: 'Appointment scheduled', value: 73, colorGrad: 'linear-gradient(90deg, oklch(38% 0.11 158), oklch(56% 0.11 158))' },
      { label: 'Added to waitlist', value: 14, colorGrad: 'linear-gradient(90deg, var(--surface-3), var(--hairline))' },
      { label: 'Provider declined', value: 8, colorGrad: 'linear-gradient(90deg, oklch(60% 0.04 250), oklch(50% 0.04 250))' },
      { label: 'No response in 7 days', value: 5, colorGrad: 'linear-gradient(90deg, oklch(58% 0.17 25), oklch(70% 0.15 25))' },
    ],
    safety: {
      urgencySla: '100% within SLA',
      crisisRouted: 7,
      accuracy: 96.2,
    }
  },
  '90': {
    members: 1294,
    membersDelta: '▲ 22% vs prior 90d',
    completedRoutes: 924,
    completedRoutesDelta: '▲ 15%',
    avgTime: 7.9,
    avgTimeDelta: '▼ 1.9 days',
    completionRate: 75,
    completionRateDelta: '▲ 5 pts',
    donutData: [
      { label: 'Therapy / counseling', value: 46, color: 'oklch(58% 0.085 195)' },
      { label: 'Community clinic', value: 20, color: 'oklch(56% 0.10 240)' },
      { label: 'Support group', value: 15, color: 'oklch(46% 0.085 200)' },
      { label: 'Medication evaluation', value: 10, color: 'oklch(70% 0.13 78)' },
      { label: 'Self-guided support', value: 9, color: 'oklch(50% 0.04 250)' },
    ],
    lineData: [
      { label: 'OCT', value: 380 },
      { label: 'NOV', value: 450 },
      { label: 'DEC', value: 510 },
      { label: 'JAN', value: 680 },
      { label: 'FEB', value: 810 },
      { label: 'MAR', value: 924 },
    ],
    barriers: [
      { label: 'Cost / out-of-pocket', value: 70 },
      { label: 'Wait time', value: 58 },
      { label: 'Insurance confusion', value: 45 },
      { label: 'Provider availability', value: 40 },
      { label: 'Uncertainty / next step', value: 25 },
      { label: 'Location / commute', value: 10 },
    ],
    outcomes: [
      { label: 'Appointment scheduled', value: 74, colorGrad: 'linear-gradient(90deg, oklch(38% 0.11 158), oklch(56% 0.11 158))' },
      { label: 'Added to waitlist', value: 13, colorGrad: 'linear-gradient(90deg, var(--surface-3), var(--hairline))' },
      { label: 'Provider declined', value: 9, colorGrad: 'linear-gradient(90deg, oklch(60% 0.04 250), oklch(50% 0.04 250))' },
      { label: 'No response in 7 days', value: 4, colorGrad: 'linear-gradient(90deg, oklch(58% 0.17 25), oklch(70% 0.15 25))' },
    ],
    safety: {
      urgencySla: '100% within SLA',
      crisisRouted: 22,
      accuracy: 96.5,
    }
  },
  '365': {
    members: 5420,
    membersDelta: '▲ 25% vs prior year',
    completedRoutes: 3980,
    completedRoutesDelta: '▲ 18%',
    avgTime: 8.5,
    avgTimeDelta: '▼ 0.8 days',
    completionRate: 71,
    completionRateDelta: '▲ 2 pts',
    donutData: [
      { label: 'Therapy / counseling', value: 42, color: 'oklch(58% 0.085 195)' },
      { label: 'Community clinic', value: 24, color: 'oklch(56% 0.10 240)' },
      { label: 'Support group', value: 16, color: 'oklch(46% 0.085 200)' },
      { label: 'Medication evaluation', value: 12, color: 'oklch(70% 0.13 78)' },
      { label: 'Self-guided support', value: 6, color: 'oklch(50% 0.04 250)' },
    ],
    lineData: [
      { label: 'JUN', value: 1200 },
      { label: 'JUL', value: 1450 },
      { label: 'AUG', value: 1800 },
      { label: 'SEP', value: 2100 },
      { label: 'OCT', value: 2500 },
      { label: 'NOV', value: 2900 },
      { label: 'DEC', value: 3200 },
      { label: 'JAN', value: 3500 },
      { label: 'FEB', value: 3800 },
      { label: 'MAR', value: 3980 },
    ],
    barriers: [
      { label: 'Cost / out-of-pocket', value: 65 },
      { label: 'Wait time', value: 60 },
      { label: 'Insurance confusion', value: 50 },
      { label: 'Provider availability', value: 35 },
      { label: 'Uncertainty / next step', value: 30 },
      { label: 'Location / commute', value: 12 },
    ],
    outcomes: [
      { label: 'Appointment scheduled', value: 71, colorGrad: 'linear-gradient(90deg, oklch(38% 0.11 158), oklch(56% 0.11 158))' },
      { label: 'Added to waitlist', value: 16, colorGrad: 'linear-gradient(90deg, var(--surface-3), var(--hairline))' },
      { label: 'Provider declined', value: 7, colorGrad: 'linear-gradient(90deg, oklch(60% 0.04 250), oklch(50% 0.04 250))' },
      { label: 'No response in 7 days', value: 6, colorGrad: 'linear-gradient(90deg, oklch(58% 0.17 25), oklch(70% 0.15 25))' },
    ],
    safety: {
      urgencySla: '100% within SLA',
      crisisRouted: 84,
      accuracy: 95.8,
    }
  }
};

export default function OrgInsights() {
  const [range, setRange] = useState<string>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'barriers' | 'safety'>('overview');
  
  const [liveStats, setLiveStats] = useState({
    patients: 0,
    routes: 0,
    referrals: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchLiveStats() {
      if (!isFirebaseConfigured || !db) {
        setLiveStats({ patients: 0, routes: 0, referrals: 0, loading: false });
        return;
      }
      try {
        const patientsSnap = await getCountFromServer(collection(db, 'patients'));
        const routesSnap = await getCountFromServer(collection(db, 'careRoutes'));
        
        let referralsCount = 0;
        try {
          const referralsSnap = await getCountFromServer(collection(db, 'referrals'));
          referralsCount = referralsSnap.data().count;
        } catch (e) {
          console.warn("Could not query collection-wide referrals count due to security rules:", e);
        }

        setLiveStats({
          patients: patientsSnap.data().count,
          routes: routesSnap.data().count,
          referrals: referralsCount,
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching live stats:", err);
        setLiveStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchLiveStats();
  }, []);

  const currentData = RANGE_DATA[range] || RANGE_DATA['30'];

  // Calculate Donut Segment offsets dynamically
  let accumulatedOffset = 0;
  const donutCircles = currentData.donutData.map((d) => {
    const dashArray = `${d.value} ${100 - d.value}`;
    const dashOffset = -accumulatedOffset;
    accumulatedOffset += d.value;
    return {
      ...d,
      dashArray,
      dashOffset,
    };
  });

  // Dynamic EAP recommendations helper based on access barriers
  const getEapActionRecommendation = (barriers: BarrierItem[]): string => {
    if (barriers.length === 0) return '';
    const dominant = barriers.reduce((max, b) => b.value > max.value ? b : max, barriers[0]);
    if (dominant.label.includes('Cost')) {
      return `Cost is the #1 barrier this period (${dominant.value}%). We recommend expanding the EAP session benefit limit from 6 to 10 visits, or establishing sliding-scale community clinic partnerships.`;
    }
    if (dominant.label.includes('Wait')) {
      return `Wait time is the #1 barrier this period (${dominant.value}%). Consider partnering with dedicated telehealth provider groups who offer same-week appointments, or expanding EAP network outreach.`;
    }
    if (dominant.label.includes('Insurance')) {
      return `Insurance confusion is the #1 barrier this period (${dominant.value}%). We recommend introducing a guided care coordinator chat or claims assistant session for out-of-network claims.`;
    }
    return `Provider availability is the main barrier. Consider onboarding additional regional clinical specialists or licensing therapists in extra states.`;
  };

  // Dynamic SVG line chart calculations
  const generateSvgLinePath = (data: LinePoint[], width: number, height: number) => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] };
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const rangeVal = max - min || 1;
    
    const paddingY = 20;
    const usableHeight = height - paddingY * 2;
    const stepX = width / (data.length - 1);
    
    const points = data.map((d, idx) => {
      const x = idx * stepX;
      const y = paddingY + usableHeight - ((d.value - min) / rangeVal) * usableHeight;
      return { x, y, label: d.label, value: d.value };
    });
    
    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${width.toFixed(1)} ${height.toFixed(1)} L 0 ${height.toFixed(1)} Z`;
    
    return { linePath, areaPath, points };
  };

  const svgWidth = 320;
  const svgHeight = 130;
  const { linePath, areaPath, points } = generateSvgLinePath(currentData.lineData, svgWidth, svgHeight);

  return (
    <AppShell 
      title="Anonymous trends" 
      crumbs={['Insights', 'Anonymous trends']}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        .tab-btn {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          border-bottom: 2px solid transparent;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          color: var(--fg);
        }
        .tab-btn.active {
          color: var(--teal);
          font-weight: 600;
          border-bottom: 2px solid var(--teal);
        }
        .dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: oklch(62% 0.16 142);
          box-shadow: 0 0 8px oklch(62% 0.16 142);
          display: inline-block;
          animation: pulse 2s infinite ease-in-out;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .kpi-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .kpi-row {
            grid-template-columns: 1fr;
          }
        }
        .kpi {
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-radius: var(--r-md);
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .kpi:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: var(--teal);
        }
        .kpi-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.3;
        }
        .kpi-value {
          font-size: 26px;
          font-weight: 700;
          color: var(--fg);
          font-family: var(--font-display);
          line-height: 1;
          margin: 4px 0 2px;
        }
        .kpi-delta {
          font-size: 11px;
          font-weight: 500;
          color: oklch(62% 0.16 142);
        }
      `}} />

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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="select" 
              style={{ width: 'auto', fontSize: '13px', padding: '7px 12px' }} 
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => alert(`Insights exported for range: last ${range} days (Simulation)`)}>Export</button>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-wise-hairline gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--hairline)', display: 'flex' }}>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview &amp; Growth</span>
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Routes &amp; Outcomes</span>
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'barriers' ? 'active' : ''}`}
            onClick={() => setActiveTab('barriers')}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Access Barriers</span>
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <Lock className="w-4 h-4" />
            <span>Safety &amp; Audit</span>
          </button>
        </div>

        {/* Tab Content rendering */}
        <div className="tab-content">
          
          {/* TAB 1: OVERVIEW & GROWTH */}
          {activeTab === 'overview' && (
            <div className="space-y-6 space-y-4">
              
              {/* EAP Privacy Banner */}
              <div className="priv-banner mb-4">
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
              <div className="kpi-row mb-6">
                <div className="kpi">
                  <span className="kpi-label">Members using care navigation</span>
                  <span className="kpi-value num">{currentData.members}</span>
                  <span className="kpi-delta">{currentData.membersDelta}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Care routes completed</span>
                  <span className="kpi-value num">{currentData.completedRoutes}</span>
                  <span className="kpi-delta">{currentData.completedRoutesDelta}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Avg. time to appointment</span>
                  <span className="kpi-value num">{currentData.avgTime}<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}> days</span></span>
                  <span className="kpi-delta">{currentData.avgTimeDelta}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Referral completion rate</span>
                  <span className="kpi-value num">{currentData.completionRate}%</span>
                  <span className="kpi-delta font-semibold">{currentData.completionRateDelta}</span>
                </div>
              </div>

              <div className="panel-grid-2 gap-6">
                {/* Member Support Demand Line Chart */}
                <div className="card p-5">
                  <div className="card-head mb-4">
                    <div>
                      <h3 className="h3">Member support demand</h3>
                      <div className="sub text-wise-muted text-xs">Monthly intakes completed. Aggregated cohort signal only.</div>
                    </div>
                  </div>
                  <div className="line-chart mt-4" style={{ height: '140px', position: 'relative' }}>
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(58% 0.085 195)" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="oklch(58% 0.085 195)" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#g1)"/>
                      <path d={linePath} fill="none" stroke="oklch(46% 0.085 200)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4" fill="oklch(46% 0.085 200)" className="hover:r-6 transition-all" />
                          <title>{p.label}: {p.value} intakes</title>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, paddingTop: '12px', borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                    {currentData.lineData.map((d, idx) => (
                      <span key={idx}>{d.label}</span>
                    ))}
                  </div>
                </div>

                {/* Live Platform Stats (Firestore connection) */}
                <div className="card p-5 flex flex-col justify-between" style={{ minHeight: '230px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <h3 className="h3">Live platform activity</h3>
                        <div className="sub text-wise-muted text-xs">Real-time counts synced with Firestore</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="dot-pulse"></span>
                        <span className="text-[10px] font-bold text-wise-muted uppercase tracking-wider">Sync Live</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '10px 0 20px' }}>
                      Below stats query active databases for this workspace session.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '14px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', textAlign: 'center', border: '1px solid var(--hairline)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patients</span>
                      <span className="text-xl font-bold num block mt-1.5" style={{ color: 'var(--fg)', fontSize: '18px' }}>
                        {liveStats.loading ? '...' : liveStats.patients}
                      </span>
                    </div>
                    <div style={{ padding: '14px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', textAlign: 'center', border: '1px solid var(--hairline)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Care Routes</span>
                      <span className="text-xl font-bold num block mt-1.5" style={{ color: 'var(--fg)', fontSize: '18px' }}>
                        {liveStats.loading ? '...' : liveStats.routes}
                      </span>
                    </div>
                    <div style={{ padding: '14px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', textAlign: 'center', border: '1px solid var(--hairline)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Referrals</span>
                      <span className="text-xl font-bold num block mt-1.5" style={{ color: 'var(--fg)', fontSize: '18px' }}>
                        {liveStats.loading ? '...' : liveStats.referrals}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ROUTES & OUTCOMES */}
          {activeTab === 'routes' && (
            <div className="panel-grid-2 gap-6">
              
              {/* Care Route Distribution Donut */}
              <div className="card p-5">
                <div className="card-head mb-4">
                  <div>
                    <h3 className="h3">Care route distribution</h3>
                    <div className="sub text-wise-muted text-xs">How members are routed after intake. Aggregated.</div>
                  </div>
                </div>
                <div className="donut-row mt-4">
                  <svg className="donut" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--surface-sunk)" strokeWidth="6"/>
                    {donutCircles.map((circle, idx) => (
                      <circle 
                        key={idx}
                        cx="21" 
                        cy="21" 
                        r="15.9" 
                        fill="none" 
                        stroke={circle.color} 
                        strokeWidth="6" 
                        strokeDasharray={circle.dashArray} 
                        strokeDashoffset={circle.dashOffset} 
                        transform="rotate(-90 21 21)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke-dasharray 0.5s ease' }}
                      />
                    ))}
                    <text x="21" y="20" textAnchor="middle" fontSize="6.5" fill="var(--fg)" fontFamily="var(--font-display)" fontWeight="600" letterSpacing="-0.04em">{currentData.completedRoutes}</text>
                    <text x="21" y="26" textAnchor="middle" fontSize="2.6" fill="var(--muted)" fontFamily="var(--font-mono)" letterSpacing="0.05em">ROUTES</text>
                  </svg>
                  <div className="legend">
                    {currentData.donutData.map((d, idx) => (
                      <div className="legend-row" key={idx}>
                        <span className="swatch" style={{ background: d.color }}></span>
                        <span className="label text-xs">{d.label}</span>
                        <span className="num font-semibold">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connection Outcomes */}
              <div className="card p-5">
                <div className="card-head mb-4">
                  <div>
                    <h3 className="h3">Connection request outcomes</h3>
                    <div className="sub text-wise-muted text-xs">Aggregated provider replies. Last 90 days baseline.</div>
                  </div>
                </div>
                <div className="bar-chart mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {currentData.outcomes.map((item, idx) => (
                    <div className="bar-h" key={idx}>
                      <span className="label text-xs" style={{ width: '135px' }}>{item.label}</span>
                      <div className="bar-h-rail" style={{ flex: 1 }}>
                        <div style={{ width: `${item.value}%`, background: item.colorGrad, transition: 'width 0.5s ease-out' }}></div>
                      </div>
                      <span className="num font-semibold text-xs ml-2">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ACCESS BARRIERS */}
          {activeTab === 'barriers' && (
            <div className="card p-5 space-y-6">
              <div className="card-head mb-2">
                <div>
                  <h3 className="h3">Access barriers metrics</h3>
                  <div className="sub text-wise-muted text-xs">What slows members between intake matches and the first appointment.</div>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {currentData.barriers.map((bar, idx) => (
                  <div className="bar-h" key={idx}>
                    <span className="label text-xs" style={{ width: '150px' }}>{bar.label}</span>
                    <div className="bar-h-rail" style={{ flex: 1 }}>
                      <div style={{ 
                        width: `${bar.value}%`, 
                        background: idx === 0 
                          ? 'linear-gradient(90deg, oklch(56% 0.13 78), oklch(70% 0.13 78))' 
                          : 'var(--muted)',
                        opacity: idx === 0 ? 1 : 0.7,
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span className="num font-semibold text-xs ml-2">{bar.value}%</span>
                  </div>
                ))}
              </div>

              {/* Actionable recommendations box based on highest barrier */}
              <div className="notice brand mt-6">
                <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
                <div style={{ fontSize: '13px' }}>
                  <strong style={{ color: 'var(--teal-deep)', display: 'block', marginBottom: '3px' }}>Dominant barrier intervention recommended</strong>
                  {getEapActionRecommendation(currentData.barriers)}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SAFETY & QUALITY */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              
              <div className="panel-grid-2 gap-6">
                
                {/* Risk Routing Audit */}
                <div className="card p-5">
                  <div className="card-head mb-4">
                    <div>
                      <h3 className="h3">Risk routing audit</h3>
                      <div className="sub text-wise-muted text-xs">System safety oversight only. No personal records.</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[14px] mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '14px', background: 'var(--success-soft)', border: '1px solid oklch(56% 0.11 158 / 0.24)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'oklch(28% 0.10 158)' }}>High-urgency routing</span>
                        <span className="badge success">{currentData.safety.urgencySla}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'oklch(34% 0.10 158)', lineHeight: 1.5 }}>
                        All flagged intakes routed to crisis support within target window. Median 4 seconds.
                      </div>
                    </div>
                    
                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Crisis support usage</span>
                        <span className="badge">{currentData.safety.crisisRouted} routed</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                        Aggregate count of members routed to 988 or local crisis line. No individual data.
                      </div>
                    </div>

                    <div style={{ padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Provider directory accuracy</span>
                        <span className="badge teal">{currentData.safety.accuracy}%</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                        Availability and insurance accuracy across 342 verified providers, validated weekly.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit & Compliance Disclaimer Card */}
                <div className="card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="h3">Compliance &amp; Security</h3>
                    <div className="sub text-wise-muted text-xs">Standard operational overview metrics</div>
                    
                    <div className="mt-4 space-y-3" style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                      <p>
                        This portal is designed to provide aggregate insights for employer benefits coordinators and administrators. It enforces a strict cohort minimum of <strong>n ≥ 10</strong> users to prevent re-identification.
                      </p>
                      <p>
                        All clinical matching, care packets, and clinician messaging occur end-to-end between patients and clinicians, bypassing organization visibility.
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ padding: '10px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                    <ShieldCheck className="w-4 h-4 text-wise-teal shrink-0" />
                    <span>HIPAA Compliant Data Architecture Proxy</span>
                  </div>
                </div>

              </div>

              {/* Global Warnings / Privacy notice */}
              <div className="notice warn flex gap-3.5 items-start">
                <Info className="w-4.5 h-4.5 text-wise-warn shrink-0 mt-0.5" />
                <div>
                  <strong>This dashboard never contains personal health information (PHI).</strong> Individual intake responses, care packets, and provider matches remain private to the member and the providers they explicitly choose to share with.
                  <div className="text-[12px] text-wise-muted mt-2">
                    For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
}
