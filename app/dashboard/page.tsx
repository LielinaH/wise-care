'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import FallbackBanner from '@/components/wise-care/FallbackBanner';
import PremiumCard from '@/components/ui/PremiumCard';
import Badge from '@/components/ui/Badge';
import Notice from '@/components/ui/Notice';
import { storage } from '@/lib/storage';
import { IntakeAnswers, CareRouteResult, Provider } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { matchProviders } from '@/lib/matching/matchProviders';
import { 
  Compass, 
  Check, 
  Bell
} from 'lucide-react';

export default function UserDashboard() {
  const [intake, setIntake] = useState<Partial<IntakeAnswers>>({});
  const [careRoute, setCareRoute] = useState<CareRouteResult | null>(null);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [matched, setMatched] = useState<Provider[]>([]);

  useEffect(() => {
    // Load local storage values on client side
    const answers = storage.getIntake();
    const route = storage.getCareRoute();
    const saved = storage.getSavedProviders();
    const requests = storage.getSentRequests();

    setIntake(answers);
    setCareRoute(route);
    setSavedProviderIds(saved);
    setSentRequests(requests);

    if (answers.concerns && answers.concerns.length > 0) {
      const results = matchProviders(answers as IntakeAnswers, MOCK_PROVIDERS);
      setMatched(results.slice(0, 3));
    }
  }, []);

  const hasCompletedIntake = intake.concerns && intake.concerns.length > 0 && careRoute;

  const handleSignOut = () => {
    storage.setRole('user');
  };

  const dashboardActions = (
    <>
      <button 
        onClick={() => alert('Demo Notification: Your matching updates are active.')} 
        className="btn btn-quiet btn-sm"
      >
        <Bell className="w-4 h-4" />
      </button>
      <Link href="/signin" onClick={handleSignOut} className="btn btn-ghost btn-sm">
        Sign out
      </Link>
    </>
  );

  return (
    <AppShell title="Dashboard" crumbs={['Care', 'Dashboard']} actions={dashboardActions}>
      <FallbackBanner isFallback={careRoute?.isFallback} />

      <div className="enter-stagger space-y-6">
        
        {/* Welcome Card using PremiumCard bezel variant */}
        <PremiumCard variant="bezel" className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 items-center">
            <div>
              <span className="kicker">Welcome back</span>
              {hasCompletedIntake ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight my-2.5">
                    Hi there — your care route is ready.
                  </h2>
                  <p className="text-wise-muted text-sm max-w-[50ch] leading-relaxed mb-5">
                    Based on what you shared, we recommend a <strong className="text-wise-fg-soft font-semibold">{careRoute.recommendedRoute}</strong>. {MOCK_PROVIDERS.length} support options are matched to your needs.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Link href="/care-route" className="btn btn-primary btn-sm flex items-center">
                      View care route
                      <span className="inner">Open →</span>
                    </Link>
                    <Link href="/matching" className="btn btn-ghost btn-sm">
                      See support options
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight my-2.5">
                    Find the right path to support.
                  </h2>
                  <p className="text-wise-muted text-sm max-w-[50ch] leading-relaxed mb-5">
                    Wise Care helps you navigate insurance, cost barriers, and clinical choices. Begin the private, 6-minute intake check-in to generate your personalized Care Route.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Link href="/intake" className="btn btn-primary btn-sm flex items-center">
                      Start private intake
                      <span className="inner">Begin →</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="p-4 bg-wise-surface-sunk border border-wise-hairline rounded-xl shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="kicker text-[10px] text-wise-muted">Care journey</span>
                  <Badge variant={hasCompletedIntake ? 'teal' : 'warn'}>
                    {hasCompletedIntake ? 'Route ready' : 'Not started'}
                  </Badge>
                </div>
                <div className="step-rail flex gap-1 mb-2">
                  <span className={`step flex-1 h-1 rounded ${hasCompletedIntake ? 'done active' : ''}`} />
                  <span className={`step flex-1 h-1 rounded ${hasCompletedIntake ? 'done active' : ''}`} />
                  <span className={`step flex-1 h-1 rounded ${hasCompletedIntake ? 'done active' : ''}`} />
                  <span className={`step flex-1 h-1 rounded ${hasCompletedIntake ? 'active' : ''}`} />
                  <span className="step flex-1 h-1 rounded bg-wise-surface-sunk" />
                  <span className="step flex-1 h-1 rounded bg-wise-surface-sunk" />
                </div>
                <div className="text-[12.5px] text-wise-muted-2">
                  {hasCompletedIntake ? 'Step 4 of 6 · Review options' : 'Step 0 of 6 · Awaiting intake'}
                </div>
              </div>
              <div className="p-4 bg-wise-teal-soft border border-wise-teal/20 rounded-xl text-xs text-wise-teal-deep flex gap-2">
                <span className="num-dot bg-wise-teal-soft text-wise-teal-deep shrink-0 mt-0.5 font-semibold">✓</span>
                <span>
                  {hasCompletedIntake && intake.safety !== 'immediate' ? (
                    <><strong>Safety check passed.</strong> No immediate risk indicators. If anything changes, crisis support is always here.</>
                  ) : intake.safety === 'immediate' ? (
                    <><strong className="text-wise-danger">Crisis flag triggered.</strong> Crisis/hotline support routing is priority.</>
                  ) : (
                    <><strong>Private & local.</strong> For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Status Strip */}
        <div className="status-strip grid grid-cols-2 md:grid-cols-4 bg-wise-surface border border-wise-hairline rounded-xl overflow-hidden shadow-sm">
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Care status</div>
            <div className="v text-[16px] font-semibold mt-1.5">
              {hasCompletedIntake ? 'Route in progress' : 'Awaiting intake'}
            </div>
            <div className="meta text-xs text-wise-muted mt-1">
              {hasCompletedIntake ? 'Started recently' : 'Not yet initiated'}
            </div>
          </div>
          <div className="status-cell p-4.5 border-r border-b md:border-b-0 border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Recommended route</div>
            <div className="v text-[16px] font-semibold mt-1.5">
              {hasCompletedIntake ? careRoute.recommendedRoute : 'Pending intake'}
            </div>
            <div className="meta text-xs text-wise-muted mt-1">
              {hasCompletedIntake ? `Focus: ${intake.concerns?.slice(0, 2).join(', ')}` : 'Awaiting input'}
            </div>
          </div>
          <div className="status-cell p-4.5 border-r border-wise-hairline">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Options matched</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">
              {hasCompletedIntake ? MOCK_PROVIDERS.length : 0}
            </div>
            <div className="meta text-xs text-wise-muted mt-1">
              {hasCompletedIntake ? 'Filter criteria matching active' : '0 matching filters'}
            </div>
          </div>
          <div className="status-cell p-4.5">
            <div className="k font-mono text-[10.5px] tracking-wider uppercase text-wise-muted-2">Connection requests</div>
            <div className="v text-[16px] font-semibold mt-1.5 num">
              {sentRequests.length} sent
            </div>
            <div className="meta text-xs text-wise-muted mt-1">
              Requires your explicit consent
            </div>
          </div>
        </div>

        {/* Next recommended action using PremiumCard */}
        <PremiumCard variant="standard">
          <div className="flex gap-4 items-start">
            <div className="ico w-11 h-11 rounded-xl bg-gradient-to-b from-wise-teal to-wise-teal-deep text-white flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div className="body flex-1">
              <span className="kicker">Next recommended action</span>
              {hasCompletedIntake ? (
                <>
                  <h3 className="text-base font-semibold tracking-tight text-wise-fg mt-0.5">
                    Review your matched support options.
                  </h3>
                  <p className="text-wise-muted text-[13.5px] mt-1 mb-3.5 leading-relaxed">
                    We've filtered {MOCK_PROVIDERS.length} support routes fitting your insurance plan, state location, and concerns. Save options that look right to customize your shareable packet.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/matching" className="btn btn-soft btn-sm text-xs font-semibold">
                      Review options →
                    </Link>
                    <Link href="/intake" className="btn btn-quiet btn-sm text-xs text-wise-fg-soft font-semibold">
                      Update intake
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-base font-semibold tracking-tight text-wise-fg mt-0.5">
                    Complete private intake check-in.
                  </h3>
                  <p className="text-wise-muted text-[13.5px] mt-1 mb-3.5 leading-relaxed">
                    Provide brief descriptors regarding your timeline, life impacts, and safety check to generate matched providers and self-guided supports.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/intake" className="btn btn-soft btn-sm text-xs font-semibold">
                      Begin intake check-in →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Grid content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Left Card: Matched Options */}
          <PremiumCard 
            variant="standard" 
            title="Matched support options"
            sub="Top 3 matches based on compatibility."
            action={
              hasCompletedIntake && (
                <Link href="/matching" className="btn btn-quiet btn-sm text-xs font-semibold">
                  See all {MOCK_PROVIDERS.length} →
                </Link>
              )
            }
          >
            {hasCompletedIntake ? (
              <div className="divide-y divide-wise-hairline mt-3">
                {matched.map((provider) => (
                  <div key={provider.id} className="provider-row flex items-center gap-3.5 py-3">
                    <div className="provider-avatar w-9 h-9 rounded-xl bg-gradient-to-br from-wise-teal-soft to-wise-blue-soft text-wise-teal-deep flex items-center justify-center font-display font-semibold text-xs shrink-0">
                      {provider.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="provider-name font-medium text-sm text-wise-fg">{provider.name}</div>
                      <div className="provider-meta text-xs text-wise-muted mt-0.5">
                        {provider.type} · {provider.modality.join(', ')} · {provider.licensure}
                      </div>
                    </div>
                    <Badge variant="teal" showDot={false}>{provider.matchScore}% match</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-wise-muted text-xs bg-wise-surface-sunk border border-dashed border-wise-border rounded-xl mt-3">
                Please complete the intake form to trigger algorithmic provider matches.
              </div>
            )}
          </PremiumCard>

          {/* Right Card: Checklist */}
          <PremiumCard 
            variant="standard" 
            title="Follow-up checklist"
            sub="Your navigation tracker."
          >
            <ul className="check-list flex flex-col gap-2 mt-3">
              <li className={`flex items-center gap-3 p-3 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft ${hasCompletedIntake ? 'done bg-wise-surface-2 text-wise-muted opacity-80' : ''}`}>
                <div className="box w-4.5 h-4.5 rounded border border-wise-border-2 flex items-center justify-center cursor-pointer">
                  {hasCompletedIntake && <Check className="w-3.5 h-3.5 text-wise-teal-deep font-bold" />}
                </div>
                <span className={`label ${hasCompletedIntake ? 'line-through' : ''}`}>Complete private intake</span>
                <span className="ml-auto font-mono text-[10px] text-wise-muted">Done</span>
              </li>
              
              <li className={`flex items-center gap-3 p-3 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft ${hasCompletedIntake ? 'done bg-wise-surface-2 text-wise-muted opacity-80' : ''}`}>
                <div className="box w-4.5 h-4.5 rounded border border-wise-border-2 flex items-center justify-center cursor-pointer">
                  {hasCompletedIntake && <Check className="w-3.5 h-3.5 text-wise-teal-deep" />}
                </div>
                <span className={`label ${hasCompletedIntake ? 'line-through' : ''}`}>View suggested care route</span>
                <span className="ml-auto font-mono text-[10px] text-wise-muted">Done</span>
              </li>
              
              <li className={`flex items-center gap-3 p-3 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft ${savedProviderIds.length >= 2 ? 'done bg-wise-surface-2 text-wise-muted opacity-80' : ''}`}>
                <div className="box w-4.5 h-4.5 rounded border border-wise-border-2 flex items-center justify-center cursor-pointer">
                  {savedProviderIds.length >= 2 && <Check className="w-3.5 h-3.5 text-wise-teal-deep" />}
                </div>
                <span className={`label ${savedProviderIds.length >= 2 ? 'line-through' : ''}`}>Save 2–3 support options</span>
                {hasCompletedIntake && savedProviderIds.length < 2 && (
                  <span className="ml-auto font-mono text-[10px] text-wise-teal-deep font-semibold">Next</span>
                )}
              </li>
              
              <li className={`flex items-center gap-3 p-3 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft ${sentRequests.length > 0 ? 'done bg-wise-surface-2 text-wise-muted opacity-80' : ''}`}>
                <div className="box w-4.5 h-4.5 rounded border border-wise-border-2 flex items-center justify-center cursor-pointer">
                  {sentRequests.length > 0 && <Check className="w-3.5 h-3.5 text-wise-teal-deep" />}
                </div>
                <span className={`label ${sentRequests.length > 0 ? 'line-through' : ''}`}>Send connection request</span>
              </li>
            </ul>
          </PremiumCard>
        </div>

        {/* Care Packet Preview */}
        {hasCompletedIntake ? (
          <PremiumCard 
            variant="standard" 
            title="Care Packet preview"
            sub="Structured clinician briefing sheet. Only shared with your consent."
            action={
              <div className="flex gap-2">
                <Link href="/care-packet" className="btn btn-ghost btn-sm text-xs font-semibold">
                  Open packet
                </Link>
                <Link href="/connection-request" className="btn btn-soft btn-sm text-xs font-semibold">
                  Share with a provider →
                </Link>
              </div>
            }
          >
            <div className="packet-preview p-4.5 bg-gradient-to-b from-wise-surface-sunk to-wise-surface border border-wise-hairline rounded-xl text-xs flex flex-col gap-2.5 mt-3">
              <div className="line flex gap-2.5 items-start text-wise-fg-soft">
                <span className="label font-mono text-[10.5px] uppercase tracking-wider text-wise-muted shrink-0 w-[110px]">Main concerns</span>
                <span>{intake.concerns?.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</span>
              </div>
              <div className="line flex gap-2.5 items-start text-wise-fg-soft">
                <span className="label font-mono text-[10.5px] uppercase tracking-wider text-wise-muted shrink-0 w-[110px]">Timeline</span>
                <span>Ongoing for a few {intake.duration}.</span>
              </div>
              <div className="line flex gap-2.5 items-start text-wise-fg-soft">
                <span className="label font-mono text-[10.5px] uppercase tracking-wider text-wise-muted shrink-0 w-[110px]">Daily impact</span>
                <span>Impacted areas: {intake.impact?.join(', ')}.</span>
              </div>
              <div className="line flex gap-2.5 items-start text-wise-fg-soft">
                <span className="label font-mono text-[10.5px] uppercase tracking-wider text-wise-muted shrink-0 w-[110px]">Care goals</span>
                <span>{careRoute.careGoals.join('. ')}</span>
              </div>
              <div className="line flex gap-2.5 items-start text-wise-fg-soft">
                <span className="label font-mono text-[10.5px] uppercase tracking-wider text-wise-muted shrink-0 w-[110px]">Preferences</span>
                <span>{intake.modality} · State of {intake.stateName} · Coverage: {intake.insurance}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-dashed border-wise-border flex justify-between items-center text-[10px] text-wise-muted">
                <span className="font-mono tracking-widest uppercase">Draft · Not shared</span>
                <Link href="/care-packet" className="text-wise-teal-deep font-semibold hover:underline">
                  View full packet →
                </Link>
              </div>
            </div>
          </PremiumCard>
        ) : null}

        {/* Disclaimer Notice using custom Notice component */}
        <Notice variant="standard" title="Clinical Disclaimer">
          <p className="text-[13.5px] leading-relaxed">
            Wise Care helps with navigation and preparation. It does not diagnose, treat, prescribe medication, or replace a licensed clinical professional. If you are in immediate danger, call <strong>988</strong> or <strong>911</strong>.
          </p>
          <p className="text-[12px] text-wise-muted-2 mt-2">
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </p>
        </Notice>

      </div>
    </AppShell>
  );
}
