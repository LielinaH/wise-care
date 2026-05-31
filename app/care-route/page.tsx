'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import PremiumCard from '@/components/ui/PremiumCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';
import { storage } from '@/lib/storage';
import { CareRouteResult, IntakeAnswers } from '@/lib/types';
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  FileText
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

  const riskBadgeVariant = (risk: string) => {
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
        
        {/* Urgent Crisis Header using custom Notice component */}
        {isCrisis && (
          <Notice variant="danger" title="Immediate Crisis Support Recommended" className="p-6">
            <p className="text-sm leading-relaxed opacity-95 max-w-[64ch] mb-4">
              Based on intake signals, we recommend connecting with immediate crisis assistance. Wise Care is an administrative access platform, not an emergency medical responder or clinician. 
              <strong> Please contact a hotline below.</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="btn btn-lg bg-wise-danger text-white text-sm font-semibold hover:opacity-90 shadow-md" href="tel:988">Call or text 988 (Lifeline)</a>
              <a className="btn btn-lg border border-wise-danger text-wise-danger text-sm font-semibold hover:bg-wise-danger/10 bg-wise-surface" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer">Chat online now</a>
              <a className="btn btn-lg btn-ghost text-sm font-semibold border-wise-danger/30 text-wise-danger bg-wise-surface" href="tel:911">Call 911 (Emergency)</a>
            </div>
          </Notice>
        )}

        {/* Pathway Header Card using PremiumCard */}
        <PremiumCard 
          variant="standard"
          kicker="Algorithmic Recommendation"
          title={careRoute.recommendedRoute}
          sub={
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-wise-muted-2 font-mono uppercase tracking-wide">Risk Level:</span>
              <Badge variant={riskBadgeVariant(careRoute.riskLevel)}>
                {careRoute.riskLevel} Risk
              </Badge>
            </div>
          }
          action={
            !isCrisis && (
              <div className="flex gap-2">
                <Link href="/matching" className="btn btn-soft btn-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 shrink-0" /> Support options
                </Link>
                <Link href="/care-packet" className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 shrink-0" /> Prepare packet
                </Link>
              </div>
            )
          }
        >
          <div className="p-4.5 bg-wise-surface-sunk border border-wise-hairline rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-wise-fg-soft mb-1.5">Route Reasoning Summary</h4>
            <p className="text-[13.5px] text-wise-fg-soft leading-relaxed">
              {careRoute.reasoningSummary}
            </p>
          </div>
        </PremiumCard>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recommended Support Types */}
          <PremiumCard variant="standard" title="Recommended Care Modalities">
            <ul className="b-list mt-3">
              {careRoute.recommendedSupportTypes.map((type, idx) => (
                <li key={idx}>
                  <span className="num-dot">{idx + 1}</span>
                  <span className="text-sm text-wise-fg-soft leading-relaxed mt-0.5">{type}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>

          {/* Barriers Identified */}
          <PremiumCard variant="standard" title="Addressed Access Barriers">
            {careRoute.detectedBarriers.length > 0 ? (
              <ul className="b-list mt-3">
                {careRoute.detectedBarriers.map((barrier, idx) => (
                  <li key={idx}>
                    <span className="num-dot bg-wise-warn-soft text-wise-warn">!</span>
                    <span className="text-sm text-wise-fg-soft leading-relaxed mt-0.5">{barrier}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-wise-muted italic py-6">No access barriers reported during intake.</div>
            )}
          </PremiumCard>
        </div>

        {/* Goals & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Goals */}
          <PremiumCard variant="standard" title="Immediate Care Goals">
            <ul className="space-y-3 mt-3">
              {careRoute.careGoals.map((goal, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-wise-teal shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>

          {/* Next Steps */}
          <PremiumCard variant="standard" title="Suggested Next Steps">
            <ul className="space-y-3 mt-3">
              {careRoute.nextSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-wise-fg-soft leading-relaxed font-medium">
                  <ArrowRight className="w-4 h-4 text-wise-teal-deep shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </div>

        {/* Safety Disclaimer using custom Notice component */}
        <Notice variant="warn" title="Clinical Disclaimer">
          <p className="text-[13.5px] leading-relaxed">
            {careRoute.safetyMessage}
          </p>
          <p className="text-[12px] text-wise-muted-2 mt-2">
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </p>
        </Notice>

      </div>
    </AppShell>
  );
}
