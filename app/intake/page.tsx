'use client';
/* eslint-disable react-hooks/incompatible-library */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import Notice from '@/components/ui/Notice';
import PremiumCard from '@/components/ui/PremiumCard';
import Badge from '@/components/ui/Badge';
import { IntakeAnswers } from '@/lib/types';

const STEPS = [
  { id: 'concerns', title: "What's bringing you here today?", sub: "Pick any that fit. You can add details below." },
  { id: 'timeline', title: "How long has this been happening?", sub: "And how intense does it feel right now?" },
  { id: 'impact', title: "How is it affecting your day-to-day?", sub: "Select what's been getting harder. There's no right answer." },
  { id: 'safety', title: "A safety check.", sub: "This question is sensitive but important. Your answer changes what we recommend next." },
  { id: 'preferences', title: "Preferences and barriers.", sub: "These help us match options that actually fit your situation and budget." },
  { id: 'review', title: "Review and submit.", sub: "Make sure this looks right before AI agents prepare your care route." },
];

const CONCERN_OPTIONS = [
  { v: 'anxiety', l: 'Anxiety or worry', s: 'Racing thoughts, on edge, hard to relax' },
  { v: 'depression', l: 'Low mood or sadness', s: 'Persistent sadness, lack of motivation' },
  { v: 'sleep', l: 'Sleep difficulties', s: 'Falling asleep, staying asleep, waking early' },
  { v: 'stress', l: 'Stress or burnout', s: 'Work, school, caregiving, life pressure' },
  { v: 'grief', l: 'Grief or loss', s: 'Recent loss or major change' },
  { v: 'relationships', l: 'Relationships', s: 'Family, partner, friendship strain' },
  { v: 'trauma', l: 'Past difficult experiences', s: 'Things from the past resurfacing' },
  { v: 'other', l: 'Something else', s: 'You can describe it below' },
];

const IMPACT_OPTIONS = [
  { v: 'sleep', l: 'Sleep quality' },
  { v: 'work', l: 'Work or school performance' },
  { v: 'concentration', l: 'Concentration / focus' },
  { v: 'energy', l: 'Energy levels' },
  { v: 'relationships', l: 'Relationships' },
  { v: 'appetite', l: 'Appetite or eating patterns' },
  { v: 'self-care', l: 'Self-care routines' },
  { v: 'mood', l: 'Mood or outlook' },
];

const SAFETY_OPTIONS = [
  { v: 'none', l: 'No safety concerns', s: 'I am not having thoughts of harming myself or others.' },
  { v: 'passing', l: 'Occasional difficult thoughts', s: 'I have had passing thoughts but no plans or intent.' },
  { v: 'recent', l: 'Recent worsening thoughts', s: 'These thoughts have been more frequent or intense recently.' },
  { v: 'immediate', l: 'Immediate concern', s: "I'm thinking about harming myself, or someone is in immediate danger." },
];

const SUPPORT_OPTIONS = [
  { v: 'therapy', l: 'Therapy / counseling', s: 'Talk-based support with a licensed clinician.' },
  { v: 'medication', l: 'Medication evaluation', s: 'Speak with a prescriber about possible medication.' },
  { v: 'group', l: 'Support group', s: 'Peer support with others going through similar things.' },
  { v: 'community', l: 'Community clinic', s: 'Affordable, in-person, comprehensive services.' },
  { v: 'self', l: 'Self-guided for now', s: "I want to start with resources I can use on my own." },
  { v: 'unsure', l: "I'm not sure", s: "That's okay. We'll suggest a path based on your situation." },
];

function IntakePageContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);

  const { register, watch, setValue } = useForm<IntakeAnswers>({
    defaultValues: {
      concerns: [],
      concernDetail: '',
      duration: 'weeks',
      intensity: 5,
      impact: [],
      safety: 'none',
      preference: 'unsure',
      insurance: 'Self-pay / sliding scale',
      modality: 'Telehealth',
      stateName: 'California',
      urgency: '1-2w',
    }
  });

  const watchedConcerns = watch('concerns') || [];
  const watchedConcernDetail = watch('concernDetail');
  const watchedDuration = watch('duration');
  const watchedIntensity = watch('intensity') || 5;
  const watchedImpact = watch('impact') || [];
  const watchedSafety = watch('safety');
  const watchedPreference = watch('preference');
  const watchedInsurance = watch('insurance');
  const watchedModality = watch('modality');
  const watchedStateName = watch('stateName');
  const watchedUrgency = watch('urgency');

  useEffect(() => {
    async function loadSavedIntake() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          const profile = await firestoreHelpers.getPatientProfile(currentUser.uid);
          if (profile && profile.intakeAnswers) {
            Object.entries(profile.intakeAnswers).forEach(([key, val]) => {
              setValue(key as any, val);
            });
          }
        } catch (e) {
          console.error("Error loading saved intake: ", e);
        }
      } else {
        const savedIntake = storage.getIntake();
        if (savedIntake.concerns) {
          Object.entries(savedIntake).forEach(([key, val]) => {
            setValue(key as any, val);
          });
        }
      }

      // Check step index cache locally
      const savedStep = storage.getIntakeStep();
      if (savedStep && savedStep < STEPS.length) {
        setStepIndex(savedStep);
      }
    }

    loadSavedIntake();
  }, [currentUser, isFirebaseMode, setValue]);

  const saveState = async (nextStep: number) => {
    const currentValues = {
      concerns: watchedConcerns,
      concernDetail: watchedConcernDetail || '',
      duration: watchedDuration,
      intensity: watchedIntensity,
      impact: watchedImpact,
      safety: watchedSafety,
      preference: watchedPreference,
      insurance: watchedInsurance,
      modality: watchedModality,
      stateName: watchedStateName,
      urgency: watchedUrgency,
    };

    if (isFirebaseMode && currentUser) {
      try {
        await firestoreHelpers.setPatientProfile(currentUser.uid, {
          intakeAnswers: currentValues,
          intakeStatus: 'started'
        });
      } catch (e) {
        console.error("Error saving intake progress: ", e);
      }
    } else {
      storage.setIntake(currentValues);
    }

    storage.setIntakeStep(nextStep);
    setStepIndex(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      await saveState(stepIndex + 1);
    } else {
      const finalData = {
        concerns: watchedConcerns,
        concernDetail: watchedConcernDetail || '',
        duration: watchedDuration,
        intensity: watchedIntensity,
        impact: watchedImpact,
        safety: watchedSafety,
        preference: watchedPreference,
        insurance: watchedInsurance,
        modality: watchedModality,
        stateName: watchedStateName,
        urgency: watchedUrgency,
      };

      if (isFirebaseMode && currentUser) {
        try {
          await firestoreHelpers.setPatientProfile(currentUser.uid, {
            intakeAnswers: finalData,
            intakeStatus: 'completed'
          });
        } catch (e) {
          console.error("Error finalizing intake: ", e);
        }
      } else {
        storage.setIntake(finalData);
      }

      storage.setIntakeStep(0); // Reset step tracking
      router.push('/ai-processing');
    }
  };

  const handleBack = async () => {
    if (stepIndex > 0) {
      await saveState(stepIndex - 1);
    }
  };

  const handleConcernToggle = (val: string) => {
    const next = [...watchedConcerns];
    const idx = next.indexOf(val);
    if (idx === -1) next.push(val);
    else next.splice(idx, 1);
    setValue('concerns', next);
  };

  const handleImpactToggle = (val: string) => {
    const next = [...watchedImpact];
    const idx = next.indexOf(val);
    if (idx === -1) next.push(val);
    else next.splice(idx, 1);
    setValue('impact', next);
  };

  const pct = Math.round((stepIndex / (STEPS.length - 1)) * 100);
  const isCrisis = watchedSafety === 'immediate';

  const intensityLabel = (v: number) => {
    if (v <= 2) return 'Mild: manageable most days';
    if (v <= 4) return 'Noticeable but not overwhelming';
    if (v <= 6) return 'Distracting, affecting some daily life';
    if (v <= 8) return 'Heavy, affecting most of daily life';
    return 'Very intense: hard to get through the day';
  };

  return (
    <AppShell title="Private Intake" crumbs={['Care', 'Intake']} actions={
      <Link href="/dashboard" className="btn btn-quiet btn-sm text-xs font-semibold">Save &amp; exit</Link>
    }>
      <div className="max-w-[720px] mx-auto space-y-6">
        
        {/* Progress bar */}
        <div className="bg-wise-bg sticky top-[78px] z-10 py-3 border-b border-wise-hairline">
          <div className="flex justify-between items-center mb-2.5 text-xs text-wise-muted">
            <span className="font-medium">Step {stepIndex + 1} of {STEPS.length}</span>
            <div className="progress-bar mx-4">
              <div style={{ width: `${Math.max(8, pct)}%` }} />
            </div>
            <span className="mono">{pct}%</span>
          </div>
          <div className="step-rail">
            {STEPS.map((_, i) => (
              <span key={i} className={`step ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {/* Step Card Container */}
        <PremiumCard variant="bezel" className="enter">
          <span className="kicker">Private intake · structured</span>
          <h2 className="text-2xl font-display font-semibold tracking-tight my-2">{STEPS[stepIndex].title}</h2>
          <p className="text-sm text-wise-muted mb-6">{STEPS[stepIndex].sub}</p>

          {/* Step 1: Concerns */}
          {stepIndex === 0 && (
            <div className="space-y-6">
              <div className="choice-grid">
                {CONCERN_OPTIONS.map((o) => {
                  const isSelected = watchedConcerns.includes(o.v);
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => handleConcernToggle(o.v)}
                      className={`choice ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="check">
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div>
                        <div className="label">{o.l}</div>
                        <div className="sub">{o.s}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="field">
                <label className="field-label">Anything you'd like to add? (optional)</label>
                <textarea
                  {...register('concernDetail')}
                  className="textarea"
                  placeholder="A sentence or two helps a lot. You can be as brief as you want."
                />
                <span className="field-hint">Your words go straight to your private summary. Nothing is shared without consent.</span>
              </div>
            </div>
          )}

          {/* Step 2: Timeline & Intensity */}
          {stepIndex === 1 && (
            <div className="space-y-6">
              <div className="field">
                <label className="field-label block mb-2">How long has this been happening?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { v: 'days', l: 'A few days' },
                    { v: 'weeks', l: 'A few weeks' },
                    { v: 'months', l: 'A few months' },
                    { v: 'longer', l: 'Longer than that' },
                  ].map((d) => {
                    const isSelected = watchedDuration === d.v;
                    return (
                      <button
                        key={d.v}
                        type="button"
                        onClick={() => setValue('duration', d.v as any)}
                        className={`choice justify-center text-center py-3.5 ${isSelected ? 'selected' : ''}`}
                      >
                        {d.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field pt-4">
                <label className="field-label">How intense does it feel (most days)?</label>
                <div className="slider-card flex flex-col items-center">
                  <div className="intensity-display">
                    {watchedIntensity}
                    <span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 'normal' }}>/10</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--muted)', marginTop: '4px' }}>
                    {intensityLabel(watchedIntensity)}
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={watchedIntensity}
                    onChange={(e) => setValue('intensity', Number(e.target.value))}
                    className="slider"
                    style={{ marginTop: '14px', width: '100%' }}
                  />
                  <div className="scale-rail w-full">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Significant</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Impact on Life */}
          {stepIndex === 2 && (
            <div className="choice-grid">
              {IMPACT_OPTIONS.map((o) => {
                const isSelected = watchedImpact.includes(o.v);
                return (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => handleImpactToggle(o.v)}
                    className={`choice ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="check">
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="label">{o.l}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4: Safety Check */}
          {stepIndex === 3 && (
            <div className="space-y-6">
              <div className="choice-grid grid-cols-1">
                {SAFETY_OPTIONS.map((o) => {
                  const isSelected = watchedSafety === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setValue('safety', o.v as any)}
                      className={`choice ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="check">
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div>
                        <div className="label">{o.l}</div>
                        <div className="sub">{o.s}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {isCrisis && (
                <Notice variant="danger" title="If you may be in immediate danger, please reach out now.">
                  <p className="text-xs leading-relaxed opacity-95 mb-3.5">
                    You do not need to finish this form. Wise Care is not a crisis service. Hotlines are confidential, free, and open 24/7.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <a className="btn btn-sm bg-wise-danger text-white text-xs font-semibold hover:opacity-90" href="tel:988">Call or text 988</a>
                    <a className="btn btn-sm border border-wise-danger text-wise-danger text-xs font-semibold hover:bg-wise-danger/10" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer">Chat online</a>
                  </div>
                </Notice>
              )}
            </div>
          )}

          {/* Step 5: Preferences and Barriers */}
          {stepIndex === 4 && (
            <div className="space-y-6">
              <div className="field">
                <label className="field-label block mb-2">What kind of support sounds right?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUPPORT_OPTIONS.map((o) => {
                    const isSelected = watchedPreference === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setValue('preference', o.v as any)}
                        className={`choice items-start ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="check mt-0.5">
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <div>
                          <div className="label text-[13.5px] leading-tight">{o.l}</div>
                          <div className="sub text-[11px] leading-normal">{o.s}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="field">
                  <label className="field-label">Insurance or payment preference</label>
                  <select
                    value={watchedInsurance}
                    onChange={(e) => setValue('insurance', e.target.value)}
                    className="select"
                  >
                    <option>Private Plan A</option>
                    <option>Private Plan B</option>
                    <option>Marketplace Plan</option>
                    <option>Public Coverage</option>
                    <option>Self-pay / sliding scale</option>
                    <option>Uninsured</option>
                    <option>I'm not sure</option>
                  </select>
                  <span className="field-hint">Helps us match providers you can actually cover.</span>
                </div>

                <div className="field">
                  <label className="field-label">State you live in</label>
                  <select
                    value={watchedStateName}
                    onChange={(e) => setValue('stateName', e.target.value)}
                    className="select"
                  >
                    {['California','Colorado','Florida','Illinois','Massachusetts','New York','Oregon','Texas','Washington']
                      .map(s => <option key={s}>{s}</option>)}
                  </select>
                  <span className="field-hint">Licensure rules require matching by physical location.</span>
                </div>
              </div>

              <div className="field pt-3">
                <label className="field-label">Telehealth or in-person?</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Telehealth', 'In-person', 'Either is fine'].map((o) => {
                    const isSelected = watchedModality === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setValue('modality', o)}
                        className={`choice justify-center py-3 ${isSelected ? 'selected' : ''}`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field pt-3">
                <label className="field-label">How soon would you like a first appointment?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { v: 'asap', l: 'As soon as possible' },
                    { v: '1-2w', l: 'Within 1–2 weeks' },
                    { v: 'month', l: 'Within a month' },
                    { v: 'flexible', l: 'No rush' },
                  ].map((o) => {
                    const isSelected = watchedUrgency === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setValue('urgency', o.v as any)}
                        className={`choice justify-center text-xs text-center py-3 ${isSelected ? 'selected' : ''}`}
                      >
                        {o.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review Answers */}
          {stepIndex === 5 && (
            <div className="p-4.5 bg-wise-surface-sunk border border-wise-hairline rounded-2xl space-y-4">
              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Concerns</span>
                <div className="text-sm font-semibold text-wise-fg flex-1 text-right">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {watchedConcerns.map(c => <Badge key={c} variant="teal" showDot={false} className="text-[10px]">{c}</Badge>)}
                  </div>
                  {watchedConcernDetail && <div className="text-xs text-wise-muted font-normal mt-1 italic">"{watchedConcernDetail}"</div>}
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4 items-center">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Timeline</span>
                <span className="text-sm font-semibold text-wise-fg text-right capitalize">A few {watchedDuration}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4 items-center">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Intensity</span>
                <span className="text-sm font-semibold text-wise-fg text-right">{watchedIntensity} / 10</span>
              </div>

              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Daily impact</span>
                <div className="text-sm font-semibold text-wise-fg flex-1 text-right">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {watchedImpact.map(i => <Badge key={i} variant="standard" showDot={false} className="text-[10px]">{i}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4 items-center">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Safety check</span>
                <Badge variant={watchedSafety === 'immediate' ? 'danger' : watchedSafety === 'recent' ? 'warn' : 'success'}>
                  {watchedSafety === 'none' && 'No concerns'}
                  {watchedSafety === 'passing' && 'Passing thoughts'}
                  {watchedSafety === 'recent' && 'Worsening thoughts'}
                  {watchedSafety === 'immediate' && 'Immediate concern'}
                </Badge>
              </div>

              <div className="flex justify-between py-2 border-b border-wise-hairline gap-4 items-center">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Support Pref</span>
                <span className="text-sm font-semibold text-wise-fg text-right capitalize">{watchedPreference}</span>
              </div>

              <div className="flex justify-between py-2 gap-4 items-center">
                <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Details</span>
                <span className="text-sm font-semibold text-wise-fg text-right">
                  {watchedModality} · {watchedStateName} · {watchedInsurance} · Urgency: {watchedUrgency}
                </span>
              </div>
            </div>
          )}

          {/* Form Footer Controls */}
          <div className="step-foot border-t border-wise-hairline pt-5 mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost btn-sm flex items-center gap-1"
              style={{ visibility: stepIndex === 0 ? 'hidden' : 'visible' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            
            <span className="text-xs text-wise-muted">
              {stepIndex < STEPS.length - 1 ? 'Your answers are saved dynamically.' : 'Click below to submit and generate care route.'}
            </span>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={stepIndex === 0 && watchedConcerns.length === 0}
              className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stepIndex === STEPS.length - 1 ? 'Submit & Review' : 'Next'}
              <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </button>
          </div>
        </PremiumCard>



      </div>
    </AppShell>
  );
}

export default function IntakePage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <IntakePageContent />
    </ProtectedRoute>
  );
}
