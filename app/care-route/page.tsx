'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import { storage } from '@/lib/storage';
import { CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  GitBranch, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert as AlertIcon, 
  Compass, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function CareRoutePage() {
  const router = useRouter();
  const [careRoute, setCareRoute] = useState<CareRouteResult | null>(null);
  const [intake, setIntake] = useState<Partial<IntakeAnswers>>({});

  useEffect(() => {
    const route = storage.getCareRoute();
    const answers = storage.getIntake();
    setCareRoute(route);
    setIntake(answers);

    if (!route) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!careRoute) return null;

  const isCrisis = careRoute.riskLevel === 'crisis';

  const riskBadgeClass = (risk: string) => {
    if (risk === 'crisis') return 'danger';
    if (risk === 'high') return 'warn';
    if (risk === 'moderate') return 'blue';
    return 'success';
  };

  return (
    <AppShell title="Your Care Route" crumbs={['Care', 'Care Route']} actions={
      <div className="flex gap-2">
        <Link href="/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
        {!isCrisis && (
          <Link href="/matching" className="btn btn-primary btn-sm flex items-center">
            View matched support
            <span className="inner">→</span>
          </Link>
        )}
      </div>
    }>
      <FallbackBanner isFallback={careRoute.isFallback} />

      <div className="enter-stagger space-y-6">
        
        {/* Urgent Crisis Header */}
        {isCrisis && (
          <div className="p-6 bg-wise-danger-soft border border-wise-danger/25 rounded-3xl flex gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-wise-danger text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-display font-semibold text-wise-danger">Immediate Crisis Support Recommended</h2>
              <p className="text-sm text-wise-danger leading-relaxed opacity-90 max-w-[64ch]">
                Based on intake signals, we recommend connecting with immediate crisis assistance. Wise Care is an administrative access platform, not an emergency medical responder or clinician. 
                <strong> Please contact a hotline below.</strong>
              </p>
              <div className="flex flex-wrap gap-3">
                <a className="btn btn-lg bg-wise-danger text-white text-sm font-semibold hover:opacity-90 shadow-md" href="tel:988">Call or text 988 (Lifeline)</a>
                <a className="btn btn-lg border border-wise-danger text-wise-danger text-sm font-semibold hover:bg-wise-danger/10 bg-wise-surface" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer">Chat online now</a>
                <a className="btn btn-lg btn-ghost text-sm font-semibold border-wise-danger/30 text-wise-danger bg-wise-surface" href="tel:911">Call 911 (Emergency)</a>
              </div>
            </div>
          </div>
        )}

        {/* Pathway Header Card */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <span className="kicker">Algorithmic Recommendation</span>
              <h2 className="text-2xl font-display font-semibold tracking-tight my-1.5">{careRoute.recommendedRoute}</h2>
              <p className="text-xs text-wise-muted-2 font-mono">Risk Level: 
                <span className={`badge ${riskBadgeClass(careRoute.riskLevel)} ml-2`}>
                  <span className="dot"></span>{careRoute.riskLevel} Risk
                </span>
              </p>
            </div>
            {!isCrisis && (
              <div className="flex gap-2">
                <Link href="/matching" className="btn btn-soft btn-sm flex items-center">
                  <Compass className="w-4 h-4 shrink-0" /> Support options
                </Link>
                <Link href="/care-packet" className="btn btn-primary btn-sm flex items-center">
                  <FileText className="w-4 h-4 shrink-0" /> Prepare packet
                </Link>
              </div>
            )}
          </div>
          
          <div className="p-4.5 bg-wise-surface-2 border border-wise-hairline rounded-xl mt-4">
            <h3 className="text-sm font-semibold text-wise-fg-soft mb-1.5">Route Reasoning Summary</h3>
            <p className="text-[13.5px] text-wise-fg-soft leading-relaxed">
              {careRoute.reasoningSummary}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recommended Support Types */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3.5">Recommended Care Modalities</h3>
            <ul className="space-y-3">
              {careRoute.recommendedSupportTypes.map((type, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{type}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Barriers Identified */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3.5">Addressed Access Barriers</h3>
            {careRoute.detectedBarriers.length > 0 ? (
              <ul className="space-y-3">
                {careRoute.detectedBarriers.map((barrier, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-wise-warn-soft text-wise-warn flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      !
                    </span>
                    <span>{barrier}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-wise-muted italic py-4">No access barriers reported during intake.</div>
            )}
          </div>
        </div>

        {/* Goals & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Goals */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3.5">Immediate Care Goals</h3>
            <ul className="space-y-3">
              {careRoute.careGoals.map((goal, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3.5">Suggested Next Steps</h3>
            <ul className="space-y-3">
              {careRoute.nextSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed font-medium">
                  <ArrowRight className="w-4 h-4 text-wise-teal-deep shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="notice warn flex items-start gap-3.5 bg-wise-warn-soft border border-wise-warn/20 rounded-xl p-4 text-[13.5px]">
          <HelpCircle className="ico w-5 h-5 shrink-0 text-wise-warn mt-0.5" />
          <div className="text-wise-fg-soft leading-normal">
            <strong>Clinical Disclaimer:</strong> {careRoute.safetyMessage}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
