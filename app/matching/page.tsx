'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Provider, IntakeAnswers } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { matchProviders } from '@/lib/matching/matchProviders';
import { Check, Star, Send } from 'lucide-react';
import ProviderCard from '@/components/ui/ProviderCard';
import PremiumCard from '@/components/ui/PremiumCard';
import Notice from '@/components/ui/Notice';

export default function ProviderMatchingPage() {
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
        <PremiumCard variant="standard" title="Matched Options Summary">
          <p className="text-xs text-wise-muted mt-1 leading-relaxed max-w-[70ch]">
            Below are synthetic provider organizations, peer groups, and community programs filtered dynamically. 
            We rank them by compatibility based on your location state, preferred modality, insurance selection, and urgency. 
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </p>
        </PremiumCard>

        {/* If no intake warning */}
        {!hasIntake && (
          <Notice variant="warn" title="Standard Directory View">
            <span className="text-xs">
              You are viewing the provider list without intake metrics. 
              Fill out the private check-in to rank these options by compatibility score and generate reasoning briefs.
            </span>
            <div className="mt-3">
              <Link href="/intake" className="btn btn-sm bg-wise-warn text-wise-fg text-xs font-semibold">
                Start private intake
              </Link>
            </div>
          </Notice>
        )}

        {/* Matches Grid */}
        <div className="space-y-4">
          {matches.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSaved={savedIds.includes(provider.id)}
              hasIntake={hasIntake || false}
              onSaveToggle={() => handleSaveToggle(provider.id, provider.name)}
              connectUrl={`/connection-request?providerId=${provider.id}`}
            />
          ))}
        </div>

      </div>
    </AppShell>
  );
}
