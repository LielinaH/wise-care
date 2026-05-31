'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Check, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { storage } from '@/lib/storage';
import AppShell from '@/components/layout/AppShell';
import { IntakeAnswers } from '@/lib/types';

// Let's define the steps
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

export default function IntakePage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  // Use react-hook-form
  const { register, handleSubmit, watch, setValue, control } = useForm<IntakeAnswers>({
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

  // Watch fields to render dynamic previews
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
    // Load existing intake if saved
    const savedIntake = storage.getIntake();
    if (savedIntake.concerns) {
      Object.entries(savedIntake).forEach(([key, val]) => {
        setValue(key as any, val);
      });
    }
    const savedStep = storage.getIntakeStep();
    if (savedStep && savedStep < STEPS.length) {
      setStepIndex(savedStep);
    }
  }, [setValue]);

  const saveState = (nextStep: number) => {
    const currentValues = watch();
    storage.setIntake(currentValues);
    storage.setIntakeStep(nextStep);
    setStepIndex(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      saveState(stepIndex + 1);
    } else {
      // Final submission trigger
      const finalData = watch();
      storage.setIntake(finalData);
      storage.setIntakeStep(0); // Reset step tracking
      router.push('/ai-processing');
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      saveState(stepIndex - 1);
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
    if (v <= 2) return 'Mild — manageable most days';
    if (v <= 4) return 'Noticeable but not overwhelming';
    if (v <= 6) return 'Distracting, affecting some daily life';
    if (v <= 8) return 'Heavy, affecting most of daily life';
    return 'Very intense — hard to get through the day';
  };

  return (
    <AppShell title="Private Intake" crumbs={['Care', 'Intake']} actions={
      <Link href="/dashboard" className="btn btn-quiet btn-sm text-xs font-semibold">Save & exit</Link>
    }>
      <div className="max-w-[720px] mx-auto space-y-6">
        
        {/* Progress bar */}
        <div className="bg-wise-bg sticky top-[78px] z-10 py-3 border-b border-wise-hairline">
          <div className="flex justify-between items-center mb-2.5 text-xs text-wise-muted">
            <span className="font-medium">Step {stepIndex + 1} of {STEPS.length}</span>
            <div className="flex-1 max-w-[200px] md:max-w-[320px] h-1.5 bg-wise-surface-sunk rounded-full mx-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-wise-teal-deep to-wise-teal transition-all duration-300" style={{ width: `${Math.max(8, pct)}%` }} />
            </div>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`flex-1 h-1 rounded ${i < stepIndex ? 'bg-wise-teal-deep' : i === stepIndex ? 'bg-wise-teal' : 'bg-wise-surface-sunk'}`} />
            ))}
          </div>
        </div>

        {/* Step Card Container */}
        <div className="card bezel border border-wise-hairline rounded-3xl bg-gradient-to-b from-wise-surface-2 to-wise-surface shadow-sm">
          <div className="inner p-6 md:p-8">
            <span className="kicker">Private intake · structured</span>
            <h2 className="text-2xl font-display font-semibold tracking-tight my-2">{STEPS[stepIndex].title}</h2>
            <p className="text-sm text-wise-muted mb-6">{STEPS[stepIndex].sub}</p>

            {/* Step 1: Concerns */}
            {stepIndex === 0 && (
              <div className="space-y-6">
                <div className="choice-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONCERN_OPTIONS.map((o) => {
                    const isSelected = watchedConcerns.includes(o.v);
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => handleConcernToggle(o.v)}
                        className={`choice flex items-start gap-3 p-4 border rounded-xl transition-all ${
                          isSelected ? 'selected border-wise-teal bg-wise-teal-soft shadow-inner' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                        }`}
                      >
                        <span className={`check w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-wise-teal-deep bg-wise-teal-deep text-white' : 'border-wise-border-2 bg-wise-surface'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <div>
                          <div className="label text-sm font-semibold text-wise-fg">{o.l}</div>
                          <div className="sub text-xs text-wise-muted mt-1 leading-normal">{o.s}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="field flex flex-col gap-1.5">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft">Anything you'd like to add? (optional)</label>
                  <textarea
                    {...register('concernDetail')}
                    className="textarea w-full p-3 border border-wise-border rounded-xl text-sm min-h-[96px] bg-wise-surface"
                    placeholder="A sentence or two helps a lot. You can be as brief as you want."
                  />
                  <span className="field-hint text-xs text-wise-muted">Your words go straight to your private summary. Nothing is shared without consent.</span>
                </div>
              </div>
            )}

            {/* Step 2: Timeline & Intensity */}
            {stepIndex === 1 && (
              <div className="space-y-6">
                <div className="field">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft block mb-2">How long has this been happening?</label>
                  <div className="choice-grid grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          className={`choice flex items-center justify-center p-3.5 border rounded-xl text-center text-sm font-medium transition-all ${
                            isSelected ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                          }`}
                        >
                          {d.l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="field flex flex-col gap-1.5 pt-4">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft">How intense does it feel — most days?</label>
                  <div className="p-5 bg-wise-surface-2 border border-wise-hairline rounded-2xl flex flex-col items-center">
                    <div className="text-4xl font-display font-semibold tracking-tight text-wise-teal-deep">
                      {watchedIntensity}
                      <span className="text-lg text-wise-muted font-normal"> / 10</span>
                    </div>
                    <div className="text-xs text-wise-muted mt-1">{intensityLabel(watchedIntensity)}</div>
                    
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={watchedIntensity}
                      onChange={(e) => setValue('intensity', Number(e.target.value))}
                      className="slider w-full mt-5 accent-wise-teal"
                    />
                    <div className="flex justify-between w-full text-[10px] font-mono text-wise-muted mt-2 uppercase tracking-wide">
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
              <div className="choice-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
                {IMPACT_OPTIONS.map((o) => {
                  const isSelected = watchedImpact.includes(o.v);
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => handleImpactToggle(o.v)}
                      className={`choice flex items-center gap-3 p-4.5 border rounded-xl transition-all ${
                        isSelected ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                      }`}
                    >
                      <span className={`check w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-wise-teal-deep bg-wise-teal-deep text-white' : 'border-wise-border-2 bg-wise-surface'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <div className="label text-sm font-semibold text-wise-fg">{o.l}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 4: Safety Check */}
            {stepIndex === 3 && (
              <div className="space-y-6">
                <div className="choice-grid grid grid-cols-1 gap-3">
                  {SAFETY_OPTIONS.map((o) => {
                    const isSelected = watchedSafety === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setValue('safety', o.v as any)}
                        className={`choice flex items-start gap-3.5 p-4.5 border rounded-xl transition-all ${
                          isSelected ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                        }`}
                      >
                        <span className={`check w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-wise-teal-deep bg-wise-teal-deep text-white' : 'border-wise-border-2 bg-wise-surface'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <div>
                          <div className="label text-sm font-semibold text-wise-fg">{o.l}</div>
                          <div className="sub text-xs text-wise-muted mt-1 leading-normal">{o.s}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Immediate crisis flag */}
                {isCrisis && (
                  <div className="p-5 bg-wise-danger-soft border border-wise-danger/25 rounded-2xl flex gap-4 mt-6">
                    <div className="w-10 h-10 rounded-xl bg-wise-danger text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-wise-danger block mb-1">If you may be in immediate danger, please reach out now.</h3>
                      <p className="text-xs text-wise-danger leading-relaxed opacity-90 mb-3.5">
                        You do not have to finish this form. Wise Care is not a crisis service. Hotlines are confidential, free, and open 24/7.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <a className="btn btn-sm bg-wise-danger text-white text-xs font-semibold hover:opacity-90" href="tel:988">Call or text 988</a>
                        <a className="btn btn-sm border border-wise-danger text-wise-danger text-xs font-semibold hover:bg-wise-danger/10" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer">Chat online</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Preferences and Barriers */}
            {stepIndex === 4 && (
              <div className="space-y-6">
                {/* Support Type */}
                <div className="field">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft block mb-2">What kind of support sounds right?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUPPORT_OPTIONS.map((o) => {
                      const isSelected = watchedPreference === o.v;
                      return (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => setValue('preference', o.v as any)}
                          className={`choice flex items-start gap-3 p-3.5 border rounded-xl text-left transition-all ${
                            isSelected ? 'selected border-wise-teal bg-wise-teal-soft shadow-inner' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                          }`}
                        >
                          <span className={`check w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'border-wise-teal-deep bg-wise-teal-deep text-white' : 'border-wise-border-2 bg-wise-surface'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <div>
                            <div className="label text-[13.5px] font-semibold text-wise-fg leading-tight">{o.l}</div>
                            <div className="sub text-[11px] text-wise-muted mt-0.5 leading-normal">{o.s}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  {/* Insurance */}
                  <div className="field flex flex-col gap-1.5">
                    <label className="field-label text-sm font-semibold text-wise-fg-soft">Insurance or payment preference</label>
                    <select
                      value={watchedInsurance}
                      onChange={(e) => setValue('insurance', e.target.value)}
                      className="select w-full p-3 border border-wise-border rounded-xl text-sm bg-wise-surface"
                    >
                      <option>Private Plan A</option>
                      <option>Private Plan B</option>
                      <option>Marketplace Plan</option>
                      <option>Public Coverage</option>
                      <option>Self-pay / sliding scale</option>
                      <option>Uninsured</option>
                      <option>I'm not sure</option>
                    </select>
                    <span className="field-hint text-xs text-wise-muted">Helps us match providers you can actually cover.</span>
                  </div>

                  {/* State */}
                  <div className="field flex flex-col gap-1.5">
                    <label className="field-label text-sm font-semibold text-wise-fg-soft">State you live in</label>
                    <select
                      value={watchedStateName}
                      onChange={(e) => setValue('stateName', e.target.value)}
                      className="select w-full p-3 border border-wise-border rounded-xl text-sm bg-wise-surface"
                    >
                      {['California','Colorado','Florida','Illinois','Massachusetts','New York','Oregon','Texas','Washington']
                        .map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="field-hint text-xs text-wise-muted">Licensure rules require matching by physical location.</span>
                  </div>
                </div>

                {/* Modality */}
                <div className="field flex flex-col gap-1.5 pt-3">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft">Telehealth or in-person?</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Telehealth', 'In-person', 'Either is fine'].map((o) => {
                      const isSelected = watchedModality === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setValue('modality', o)}
                          className={`choice flex items-center justify-center p-3 border rounded-xl text-sm font-medium transition-all ${
                            isSelected ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Urgency */}
                <div className="field flex flex-col gap-1.5 pt-3">
                  <label className="field-label text-sm font-semibold text-wise-fg-soft">How soon would you like a first appointment?</label>
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
                          className={`choice flex items-center justify-center p-3 border rounded-xl text-xs font-medium text-center transition-all ${
                            isSelected ? 'selected border-wise-teal bg-wise-teal-soft' : 'border-wise-border hover:border-wise-border-2 bg-wise-surface'
                          }`}
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
              <div className="p-4.5 bg-wise-surface-2 border border-wise-hairline rounded-2xl space-y-4">
                <div className="flex justify-between py-2 border-b border-wise-hairline gap-4">
                  <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Concerns</span>
                  <div className="text-sm font-semibold text-wise-fg flex-1 text-right">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {watchedConcerns.map(c => <span key={c} className="badge teal text-[10px]">{c}</span>)}
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
                      {watchedImpact.map(i => <span key={i} className="badge text-[10px]">{i}</span>)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-wise-hairline gap-4 items-center">
                  <span className="font-mono text-[10px] uppercase text-wise-muted tracking-wider shrink-0 w-32">Safety check</span>
                  <span className={`badge ${watchedSafety === 'immediate' ? 'danger' : watchedSafety === 'recent' ? 'warn' : 'success'}`}>
                    {watchedSafety === 'none' && 'No concerns'}
                    {watchedSafety === 'passing' && 'Passing thoughts'}
                    {watchedSafety === 'recent' && 'Worsening thoughts'}
                    {watchedSafety === 'immediate' && 'Immediate concern'}
                  </span>
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
                className="btn btn-ghost btn-sm"
                style={{ visibility: stepIndex === 0 ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>
              
              <span className="text-xs text-wise-muted">
                {stepIndex < STEPS.length - 1 ? 'Your answers are auto-saved.' : 'Click below to run safety & routing review.'}
              </span>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={stepIndex === 0 && watchedConcerns.length === 0}
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stepIndex === STEPS.length - 1 ? 'Submit & Review' : 'Next'}
                <span className="inner flex items-center gap-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="notice flex items-start gap-3 bg-wise-surface-2 border border-wise-hairline rounded-xl p-4 text-[13px]">
            <Info className="w-5 h-5 text-wise-muted shrink-0 mt-0.5" />
            <div>
              <strong className="text-wise-fg font-semibold">Responsible AI.</strong> Wise Care uses intake parameters strictly to recommend care pathways. We never monetize or distribute sensitive health information.
            </div>
          </div>
          <div className="notice warn flex items-start gap-3 bg-wise-warn-soft border border-wise-warn/20 rounded-xl p-4 text-[13px]">
            <AlertTriangle className="w-5 h-5 text-wise-warn shrink-0 mt-0.5" />
            <div>
              <strong>Immediate need?</strong> You do not need to finish this intake. Call/text the <strong>988 Suicide & Crisis Lifeline</strong> anytime for direct professional help.
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
