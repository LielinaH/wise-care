'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Provider, IntakeAnswers } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { matchProviders } from '@/lib/matching/matchProviders';
import { Check, Star, Send, Filter, Info, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import ProviderCard from '@/components/ui/ProviderCard';
import PremiumCard from '@/components/ui/PremiumCard';
import Notice from '@/components/ui/Notice';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';

function ProviderMatchingPageContent() {
  const { currentUser, isFirebaseMode } = useAuth();
  const [intake, setIntake] = useState<Partial<IntakeAnswers>>({});
  const [matches, setMatches] = useState<Provider[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    modality: 'all',
    insurance: 'all',
    slidingScale: false,
  });
  const [sortBy, setSortBy] = useState('best');

  useEffect(() => {
    async function loadProviders() {
      let activeSaved: string[] = [];
      let currentIntake: Partial<IntakeAnswers> = {};

      if (isFirebaseMode && currentUser) {
        try {
          const profile = await firestoreHelpers.getPatientProfile(currentUser.uid);
          if (profile) {
            currentIntake = profile.intakeAnswers || {};
            activeSaved = profile.savedProviderIds || [];
          }
          
          // Fetch providers from Firestore
          const { solo, org } = await firestoreHelpers.getAllProviders();
          
          const dbProviders: Provider[] = [];
          solo.forEach(s => {
            // Only show verified providers who are accepting new clients
            if (s.verificationStatus === 'verified' && s.availability !== 'No availability') {
              dbProviders.push({
                id: s.userId,
                name: s.displayName,
                type: 'Solo Clinician',
                licensure: `${s.licenseType} (${s.licenseState})`,
                specialty: s.specialties,
                modality: s.modalities,
                insurance: s.coverageOptions,
                slidingScale: s.coverageOptions.some(o => o.toLowerCase().includes('sliding') || o.toLowerCase().includes('scale') || o.toLowerCase().includes('self')),
                nextAvailable: s.availability || '1-2 weeks',
                sessionCost: '$120 - $180',
                matchScore: 0,
                matchReason: ''
              });
            }
          });

          org.forEach(o => {
            // Only show verified clinics who are open for matching
            if (o.verificationStatus === 'verified' && o.availability !== 'No availability') {
              dbProviders.push({
                id: o.orgId,
                name: o.organizationName,
                type: 'Clinic Group',
                licensure: 'Verified Facility',
                specialty: o.specialties,
                modality: o.modalities,
                insurance: o.coverageOptions,
                slidingScale: o.coverageOptions.some(cov => cov.toLowerCase().includes('sliding') || cov.toLowerCase().includes('scale') || cov.toLowerCase().includes('self')),
                nextAvailable: o.availability || 'Within a week',
                sessionCost: '$60 - $150',
                matchScore: 0,
                matchReason: ''
              });
            }
          });

          // Merge mock providers if Firestore has no verified providers
          const allProviders = dbProviders.length > 0 ? dbProviders : MOCK_PROVIDERS;

          setIntake(currentIntake);
          setSavedIds(activeSaved);

          if (currentIntake.concerns && currentIntake.concerns.length > 0) {
            const results = matchProviders(currentIntake as IntakeAnswers, allProviders);
            setMatches(results);
          } else {
            setMatches(allProviders.map(p => ({ ...p, matchScore: 0, matchReason: 'Please complete intake to generate score details.' })));
          }
        } catch (e) {
          console.error("Error loading matching data: ", e);
        }
      } else {
        currentIntake = storage.getIntake();
        activeSaved = storage.getSavedProviders();
        setIntake(currentIntake);
        setSavedIds(activeSaved);

        if (currentIntake.concerns && currentIntake.concerns.length > 0) {
          const results = matchProviders(currentIntake as IntakeAnswers, MOCK_PROVIDERS);
          setMatches(results);
        } else {
          setMatches(MOCK_PROVIDERS.map(p => ({ ...p, matchScore: 0, matchReason: 'Please complete intake to generate score details.' })));
        }
      }
      setLoading(false);
    }

    loadProviders();
  }, [currentUser, isFirebaseMode]);

  const handleSaveToggle = async (id: string, name: string) => {
    const isSaved = savedIds.includes(id);
    let updatedSavedIds = [...savedIds];
    if (isSaved) {
      updatedSavedIds = updatedSavedIds.filter(item => item !== id);
      if (isFirebaseMode && currentUser) {
        await firestoreHelpers.setPatientProfile(currentUser.uid, { savedProviderIds: updatedSavedIds });
      } else {
        storage.unsaveProvider(id);
      }
      setSavedIds(updatedSavedIds);
      showToast(`Removed ${name} from your care plan.`);
    } else {
      updatedSavedIds = [...updatedSavedIds, id];
      if (isFirebaseMode && currentUser) {
        await firestoreHelpers.setPatientProfile(currentUser.uid, { savedProviderIds: updatedSavedIds });
      } else {
        storage.saveProvider(id);
      }
      setSavedIds(updatedSavedIds);
      showToast(`Saved ${name} to your care plan!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const hasIntake = intake.concerns && intake.concerns.length > 0;

  // Filter chips definitions
  const FILTER_CHIPS = {
    type: [
      { v: 'all', l: 'All types' },
      { v: 'Therapist', l: 'Therapists' },
      { v: 'Medication evaluation', l: 'Medication eval' },
      { v: 'Group practice', l: 'Group practice' },
      { v: 'Community clinic', l: 'Community clinic' },
      { v: 'Support group', l: 'Support group' },
    ],
    modality: [
      { v: 'all', l: 'Any' },
      { v: 'Telehealth', l: 'Telehealth' },
      { v: 'In-person', l: 'In-person' },
    ],
    insurance: [
      { v: 'all', l: 'Any payment' },
      { v: 'Aetna', l: 'Aetna' },
      { v: 'BCBS', l: 'BCBS' },
      { v: 'Cigna', l: 'Cigna' },
      { v: 'United', l: 'United' },
      { v: 'Sliding scale', l: 'Sliding scale' },
      { v: 'Self-pay', l: 'Self-pay' },
      { v: 'Free', l: 'Free' },
    ],
  };

  const passes = (p: Provider) => {
    if (activeFilters.type !== 'all' && p.type !== activeFilters.type) return false;
    if (activeFilters.modality !== 'all' && !p.modality.includes(activeFilters.modality)) return false;
    if (activeFilters.insurance !== 'all' && !p.insurance.some(i => i.toLowerCase().includes(activeFilters.insurance.toLowerCase()))) return false;
    if (activeFilters.slidingScale && !p.slidingScale) return false;
    return true;
  };

  const filtered = matches.filter(passes);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'availability') {
      return a.nextAvailable.localeCompare(b.nextAvailable);
    }
    if (sortBy === 'cost') {
      return a.sessionCost.localeCompare(b.sessionCost);
    }
    return b.matchScore - a.matchScore;
  });

  return (
    <AppShell 
      title="Matched support options" 
      crumbs={['Care', 'Care route', 'Options']} 
      actions={
        <div className="flex gap-2">
          <Link href="/care-packet" className="btn btn-primary btn-sm">
            Open packet<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
          </Link>
        </div>
      }
    >
      <div className="enter">
        
        {/* Banner toast */}
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">Matched for you</span>
            <h2 className="h2" style={{ margin: '8px 0 4px' }}>Support options that fit your route.</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
              Filtered by your insurance, location, and preferences. Save options you'd like to revisit.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/care-route" className="btn btn-quiet btn-sm flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Care route</span>
            </Link>
            <Link href="/care-packet" className="btn btn-ghost btn-sm">Open packet</Link>
          </div>
        </div>

        {/* If no intake warning */}
        {!hasIntake && (
          <Notice variant="warn" title="Standard Directory View" className="mb-6">
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

        <div className="match-grid">
          {/* Sidebar Filters */}
          <aside className="filters">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter className="w-3.5 h-3.5" /> Filters
            </h4>

            <div className="filter-block">
              <span className="lbl">Support type</span>
              <div className="filter-pill-row">
                {FILTER_CHIPS.type.map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setActiveFilters(prev => ({ ...prev, type: c.v }))}
                    className={`filter-pill ${activeFilters.type === c.v ? 'active' : ''}`}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-block">
              <span className="lbl">How you meet</span>
              <div className="filter-pill-row">
                {FILTER_CHIPS.modality.map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setActiveFilters(prev => ({ ...prev, modality: c.v }))}
                    className={`filter-pill ${activeFilters.modality === c.v ? 'active' : ''}`}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-block">
              <span className="lbl">Payment / insurance</span>
              <div className="filter-pill-row">
                {FILTER_CHIPS.insurance.map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setActiveFilters(prev => ({ ...prev, insurance: c.v }))}
                    className={`filter-pill ${activeFilters.insurance === c.v ? 'active' : ''}`}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="lbl" style={{ margin: 0 }}>Sliding scale only</span>
              <button 
                onClick={() => setActiveFilters(prev => ({ ...prev, slidingScale: !prev.slidingScale }))}
                className={`filter-pill ${activeFilters.slidingScale ? 'active' : ''}`}
              >
                {activeFilters.slidingScale ? 'On' : 'Off'}
              </button>
            </div>

            <div className="filter-block">
              <span className="lbl">Saved to plan</span>
              <div style={{ fontSize: '12.5px', color: 'var(--muted-2)' }}>
                {savedIds.length} option{savedIds.length === 1 ? '' : 's'} saved
              </div>
              {savedIds.length > 0 && (
                <Link href="/care-packet" style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', color: 'var(--teal-deep)', fontWeight: 500 }}>
                  Review saved <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
                </Link>
              )}
            </div>
          </aside>

          {/* Results Main Pane */}
          <div>
            <div className="results-head">
              <div className="results-count">
                <strong>{sorted.length}</strong> option{sorted.length === 1 ? '' : 's'} match your filters · ranked by fit
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="select" 
                style={{ width: 'auto', fontSize: '13px', padding: '7px 12px' }}
              >
                <option value="best">Sort · Best match</option>
                <option value="availability">Sort · Earliest availability</option>
                <option value="cost">Sort · Lowest cost</option>
              </select>
            </div>

            {/* Crisis Callout for High Safety Risks */}
            {(intake.safety === 'immediate' || intake.safety === 'recent') && (
              <div className="resource-callout">
                <div className="ico bg-wise-danger text-white">
                  <AlertTriangle className="w-[18px] h-[18px]" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Crisis & Urgent Hotlines</h4>
                  <p>
                    If your safety changes, please reach out to emergency resources. Professional services are available 24/7.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a href="tel:988" className="btn btn-danger btn-sm">Call or text 988</a>
                    <a href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Chat online</a>
                  </div>
                </div>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p className="muted">No options match these filters. Try widening the criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sorted.map((provider, i) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSaved={savedIds.includes(provider.id)}
                    hasIntake={hasIntake || false}
                    isFeatured={i === 0 && hasIntake && provider.matchScore > 85}
                    onSaveToggle={() => handleSaveToggle(provider.id, provider.name)}
                    connectUrl={`/connection-request?provider=${provider.id}`}
                  />
                ))}
              </div>
            )}

            <div className="notice" style={{ marginTop: '18px' }}>
              <Info className="w-4 h-4 shrink-0 text-wise-muted mt-0.5" />
              <div>
                <strong style={{ color: 'var(--fg)' }}>A note on these listings.</strong> Names, costs, and availability are simulated for this prototype. In production, listings would refresh from verified provider directories and your insurance plan.
                <div className="text-[12px] text-wise-muted mt-2">
                  This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not diagnose, provide therapy, prescribe medication, or replace a licensed professional.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function ProviderMatchingPage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <ProviderMatchingPageContent />
    </ProtectedRoute>
  );
}
