'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Provider, IntakeAnswers } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { matchProviders } from '@/lib/matching/matchProviders';
import { Check, Star, Send, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ProviderMatchingPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<Partial<IntakeAnswers>>({});
  const [matches, setMatches] = useState<Provider[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const answers = storage.getIntake();
    const saved = storage.getSavedProviders();
    setIntake(answers);
    setSavedIds(saved);

    if (answers.concerns && answers.concerns.length > 0) {
      const results = matchProviders(answers as IntakeAnswers, MOCK_PROVIDERS);
      setMatches(results);
    } else {
      // If intake not done, show all unscored
      setMatches(MOCK_PROVIDERS.map(p => ({ ...p, matchScore: 0, matchReason: 'Please complete intake to generate score details.' })));
    }
  }, []);

  const handleSaveToggle = (id: string, name: string) => {
    const isSaved = savedIds.includes(id);
    if (isSaved) {
      storage.unsaveProvider(id);
      setSavedIds(prev => prev.filter(item => item !== id));
      showToast(`Removed ${name} from your care plan.`);
    } else {
      storage.saveProvider(id);
      setSavedIds(prev => [...prev, id]);
      showToast(`Saved ${name} to your care plan!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const hasIntake = intake.concerns && intake.concerns.length > 0;

  return (
    <AppShell title="Support Options" crumbs={['Care', 'Support Options']} actions={
      <div className="flex gap-2">
        <Link href="/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
        <Link href="/intake" className="btn btn-quiet btn-sm text-xs font-semibold">Update Intake</Link>
      </div>
    }>
      <div className="enter-stagger space-y-6">
        
        {/* Banner toast */}
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Informational Header */}
        <div className="card bg-wise-surface border border-wise-hairline rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Matched Options Summary</h2>
          <p className="text-xs text-wise-muted mt-1 leading-relaxed max-w-[70ch]">
            Below are synthetic provider organizations, peer groups, and community programs filtered dynamically. 
            We rank them by compatibility based on your location state, preferred modality, insurance selection, and urgency. 
            You must consent explicitly before sharing any details.
          </p>
        </div>

        {/* If no intake warning */}
        {!hasIntake && (
          <div className="p-5 bg-wise-warn-soft border border-wise-warn/20 rounded-2xl flex gap-3 text-wise-warn">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-semibold mb-1">Standard Directory View</strong>
              <span className="text-xs">
                You are viewing the provider list without intake metrics. 
                Fill out the private check-in to rank these options by compatibility score and generate reasoning briefs.
              </span>
              <div className="mt-3">
                <Link href="/intake" className="btn btn-sm bg-wise-warn text-wise-fg text-xs font-semibold">
                  Start private intake
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        <div className="space-y-4">
          {matches.map((provider) => {
            const isSaved = savedIds.includes(provider.id);
            return (
              <div 
                key={provider.id} 
                className={`card bg-wise-surface border rounded-2xl p-5 md:p-6 shadow-sm transition-all flex flex-col md:flex-row md:items-start justify-between gap-5 ${
                  isSaved ? 'border-wise-teal/30 bg-gradient-to-b from-wise-surface to-wise-teal-soft/10' : 'border-wise-hairline'
                }`}
              >
                {/* Provider Card Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge font-mono text-[10px] uppercase">{provider.type}</span>
                    <span className="badge teal font-mono text-[10px] uppercase">{provider.licensure}</span>
                    {provider.slidingScale && <span className="badge success font-mono text-[10px]">Sliding Scale</span>}
                    
                    {hasIntake && (
                      <span className="badge blue ml-auto md:ml-0 font-semibold">{provider.matchScore}% Match</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-wise-fg">{provider.name}</h3>
                    <p className="text-[12.5px] text-wise-muted mt-1 leading-normal">
                      <strong>Focus areas:</strong> {provider.specialty.join(', ')}
                    </p>
                  </div>

                  {/* Why Matched explanation */}
                  {hasIntake && (
                    <div className="p-3 bg-wise-surface-2 border border-wise-hairline rounded-xl text-xs text-wise-fg-soft leading-relaxed flex gap-2">
                      <span className="font-semibold text-wise-teal-deep text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Match logic:</span>
                      <span>{provider.matchReason}</span>
                    </div>
                  )}

                  {/* Extra metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-wise-hairline">
                    <div>
                      <span className="text-wise-muted block">Availability</span>
                      <span className="font-semibold text-wise-fg-soft">{provider.nextAvailable}</span>
                    </div>
                    <div>
                      <span className="text-wise-muted block">Session Cost</span>
                      <span className="font-semibold text-wise-fg-soft">{provider.sessionCost}</span>
                    </div>
                    <div>
                      <span className="text-wise-muted block">Modalities</span>
                      <span className="font-semibold text-wise-fg-soft">{provider.modality.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-wise-muted block">Insurances Accepted</span>
                      <span className="font-semibold text-wise-fg-soft truncate block max-w-[130px]" title={provider.insurance.join(', ')}>
                        {provider.insurance.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions column */}
                <div className="shrink-0 flex md:flex-col justify-end md:justify-start gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-wise-border md:w-44">
                  <button
                    onClick={() => handleSaveToggle(provider.id, provider.name)}
                    type="button"
                    className={`btn btn-sm w-full flex items-center justify-center gap-1.5 ${
                      isSaved ? 'btn-soft' : 'btn-ghost'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-wise-teal-deep text-wise-teal-deep' : ''}`} />
                    <span>{isSaved ? 'Saved to plan' : 'Save to plan'}</span>
                  </button>

                  <Link 
                    href={`/connection-request?providerId=${provider.id}`} 
                    className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    Connect →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}
