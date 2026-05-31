'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Stethoscope, Check, ArrowRight } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import Notice from '@/components/ui/Notice';

const SPECIALTIES = ['Anxiety', 'Depression', 'Mood', 'Sleep', 'Burnout', 'Relationships', 'Trauma', 'Substance use'];
const INSURANCES = ['Private Plan A', 'Private Plan B', 'Marketplace Plan', 'Public Coverage', 'Self-pay', 'Sliding scale'];

export default function ProviderRegister() {
  const router = useRouter();
  
  const [name, setName] = useState('Northstar Community Counseling');
  const [type, setType] = useState('Therapist');
  const [license, setLicense] = useState('LCSW · CA #LCS24011');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Anxiety', 'Sleep', 'Burnout']);
  const [modalities, setModalities] = useState<string[]>(['Telehealth']);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>(['Private Plan A', 'Private Plan B', 'Self-pay']);
  const [slidingScale, setSlidingScale] = useState(true);
  const [cost, setCost] = useState('$140 / session');
  const [availability, setAvailability] = useState('Wed · 7 days');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for matching reference
    const providerProfile = {
      id: 'p-01', // Overwrite Northstar CA settings
      name,
      type,
      licensure: license,
      specialty: selectedSpecs,
      modality: modalities,
      insurance: selectedInsurances,
      slidingScale,
      nextAvailable: availability,
      sessionCost: cost,
      matchReason: 'Customized provider profile match',
      matchScore: 100
    };
    
    storage.setStorageItem('wisecare.providers', [providerProfile]);
    
    setToastMsg('Profile settings updated successfully!');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/dashboard');
    }, 1500);
  };

  const toggleSpecialty = (s: string) => {
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]);
  };

  const toggleInsurance = (i: string) => {
    setSelectedInsurances(prev => prev.includes(i) ? prev.filter(item => item !== i) : [...prev, i]);
  };

  return (
    <AppShell title="Profile Settings" crumbs={['Practice', 'Settings']} actions={
      <Link href="/provider/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</Link>
    }>
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-[720px] mx-auto space-y-6 enter-stagger">
        
        {/* Intro */}
        <PremiumCard variant="bezel">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-wise-teal-deep" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Clinician Directory Management</h2>
              <p className="text-xs text-wise-muted mt-0.5 leading-relaxed">
                Configure your listing preferences. This state will dynamically affect matching compatibility calculations when individuals search for care routes.
              </p>
            </div>
          </div>
        </PremiumCard>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Base credentials */}
          <PremiumCard
            variant="standard"
            title="1. Credentials & Directory Information"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="field flex flex-col gap-1.5">
                <label className="field-label text-xs font-semibold text-wise-fg-soft">Provider or Clinic Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input p-3 text-sm border border-wise-border rounded-xl bg-wise-surface focus:outline-none focus:border-wise-teal"
                  required
                />
              </div>
              <div className="field flex flex-col gap-1.5">
                <label className="field-label text-xs font-semibold text-wise-fg-soft">Provider Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="select p-3 text-sm border border-wise-border rounded-xl bg-wise-surface focus:outline-none focus:border-wise-teal"
                >
                  <option>Therapist</option>
                  <option>Medication evaluation</option>
                  <option>Group practice</option>
                  <option>Community clinic</option>
                  <option>Support group</option>
                </select>
              </div>
            </div>

            <div className="field flex flex-col gap-1.5 mt-4">
              <label className="field-label text-xs font-semibold text-wise-fg-soft">Licensure / State Scope</label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="input p-3 text-sm border border-wise-border rounded-xl bg-wise-surface focus:outline-none focus:border-wise-teal"
                required
              />
              <span className="field-hint text-[11px] text-wise-muted">Example: LCSW · CA #LCS24011</span>
            </div>
          </PremiumCard>

          {/* Specialties checkboxes */}
          <PremiumCard
            variant="standard"
            title="2. Specialty Focus Tags"
            sub="Select which mental health areas you specialize in. Users matching these concerns will see higher score compatibility."
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 mt-4">
              {SPECIALTIES.map(s => {
                const isSelected = selectedSpecs.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`p-2.5 text-xs font-medium border rounded-xl transition-all ${
                      isSelected ? 'bg-wise-teal-soft text-wise-teal-deep border-wise-teal' : 'bg-wise-surface border-wise-border hover:border-wise-border-2'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </PremiumCard>

          {/* Insurance checkboxes */}
          <PremiumCard
            variant="standard"
            title="3. Payment & Insurances Accepted"
            sub="Select all payment types and insurances you support."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 mt-4">
              {INSURANCES.map(i => {
                const isSelected = selectedInsurances.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInsurance(i)}
                    className={`p-2.5 text-xs font-medium border rounded-xl transition-all ${
                      isSelected ? 'bg-wise-teal-soft text-wise-teal-deep border-wise-teal' : 'bg-wise-surface border-wise-border hover:border-wise-border-2'
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t border-wise-hairline mt-4">
              <input
                type="checkbox"
                id="sliding"
                checked={slidingScale}
                onChange={(e) => setSlidingScale(e.target.checked)}
                className="w-4 h-4 rounded border-wise-border text-wise-teal cursor-pointer"
              />
              <label htmlFor="sliding" className="text-xs text-wise-fg-soft font-semibold select-none cursor-pointer">
                I offer sliding scale slots for cost-sensitive clients
              </label>
            </div>
          </PremiumCard>

          {/* Costs & availability */}
          <PremiumCard
            variant="standard"
            title="4. Availability & Cost Details"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="field flex flex-col gap-1.5">
                <label className="field-label text-xs font-semibold text-wise-fg-soft">Standard Session Cost</label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input p-3 text-sm border border-wise-border rounded-xl bg-wise-surface focus:outline-none focus:border-wise-teal"
                  placeholder="e.g. $140 / session"
                  required
                />
              </div>
              <div className="field flex flex-col gap-1.5">
                <label className="field-label text-xs font-semibold text-wise-fg-soft">Next Available Slot</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="input p-3 text-sm border border-wise-border rounded-xl bg-wise-surface focus:outline-none focus:border-wise-teal"
                  placeholder="e.g. Wed · 7 days"
                  required
                />
              </div>
            </div>

            <div className="field flex flex-col gap-1.5 mt-4 pt-4 border-t border-wise-hairline">
              <label className="field-label text-xs font-semibold text-wise-fg-soft">Preferred Modalities</label>
              <div className="flex gap-4 text-xs pt-1">
                {['Telehealth', 'In-person'].map(m => (
                  <label key={m} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={modalities.includes(m)}
                      onChange={(e) => {
                        if (e.target.checked) setModalities(prev => [...prev, m]);
                        else setModalities(prev => prev.filter(item => item !== m));
                      }}
                      className="w-4 h-4 rounded border-wise-border text-wise-teal cursor-pointer"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </PremiumCard>

          {/* Form submits */}
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
              Save profile settings
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

        </form>

        {/* Prototype Disclaimer */}
        <Notice variant="standard">
          For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
        </Notice>

      </div>
    </AppShell>
  );
}
