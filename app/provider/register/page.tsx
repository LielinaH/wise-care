'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Check, Info, Lock, ArrowRight } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ALL_SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];
const ALL_INSURANCES = ['Aetna', 'BCBS', 'Cigna', 'United', 'Self-pay', 'Marketplace Plan'];

export default function ProviderRegister() {
  const router = useRouter();
  
  // States matching the archive form
  const [name, setName] = useState('Quietford Counseling Collective');
  const [type, setType] = useState('Group practice / collective');
  const [licenseType, setLicenseType] = useState('LMFT · Licensed Marriage & Family Therapist');
  const [licenseNumber, setLicenseNumber] = useState('LMF24-091877');
  const [licenseState, setLicenseState] = useState('California');
  const [yearsOfPractice, setYearsOfPractice] = useState('11');
  
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Anxiety', 'Burnout', 'Sleep', 'Relationships']);
  const [approach, setApproach] = useState('Short-term CBT and ACT-informed therapy for adults with anxiety, sleep, and work-stress patterns. Weekly individual sessions, telehealth-first. Our practice prioritizes accessibility and offers sliding scale.');
  
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>(['Aetna', 'BCBS', 'Cigna', 'United', 'Self-pay']);
  const [slidingScale, setSlidingScale] = useState(true);
  const [slidingScaleMin, setSlidingScaleMin] = useState(80);
  const [slidingScaleMax, setSlidingScaleMax] = useState(180);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Telehealth');
  const [hours, setHours] = useState('Tue / Wed / Thu evenings · 5–8pm');
  
  const [email, setEmail] = useState('practice@quietfordcollective.example');
  const [phone, setPhone] = useState('(555) 0142-8830');
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load from storage if preset
    const stored = storage.getStorageItem<any[]>('wisecare.providers', []);
    if (stored.length > 0) {
      const p = stored[0];
      if (p.name) setName(p.name);
      if (p.type) setType(p.type);
      if (p.licensure) {
        const parts = p.licensure.split(' · ');
        if (parts[0]) setLicenseType(parts[0]);
        if (parts[1]) setLicenseNumber(parts[1]);
      }
      if (p.specialty) setSelectedSpecs(p.specialty);
      if (p.insurance) setSelectedInsurances(p.insurance);
      if (p.slidingScale !== undefined) setSlidingScale(p.slidingScale);
      if (p.nextAvailable) setHours(p.nextAvailable);
      if (p.modality && p.modality.length > 0) {
        if (p.modality.includes('Telehealth') && p.modality.includes('In-person')) {
          setModality('Both');
        } else if (p.modality.includes('Telehealth')) {
          setModality('Telehealth');
        } else {
          setModality('In-person');
        }
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for matching reference
    const providerProfile = {
      id: 'p-01', // Standard identifier
      name,
      type,
      licensure: `${licenseType} · ${licenseNumber}`,
      specialty: selectedSpecs,
      modality: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
      insurance: selectedInsurances,
      slidingScale,
      nextAvailable: hours,
      sessionCost: slidingScale ? `$${slidingScaleMin} – $${slidingScaleMax}` : '$150 / session',
      matchReason: 'Customized provider profile match',
      matchScore: 100
    };
    
    storage.setStorageItem('wisecare.providers', [providerProfile]);
    
    setToastMsg('Profile saved · listings live within 24 hours');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/dashboard');
    }, 1500);
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const toggleInsurance = (ins: string) => {
    setSelectedInsurances(prev => 
      prev.includes(ins) ? prev.filter(i => i !== ins) : [...prev, ins]
    );
  };

  return (
    <AppShell 
      title="Practice profile" 
      crumbs={['Practice', 'Profile']}
      actions={
        <Link href="/provider/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</Link>
      }
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="reg-wrap enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Provider profile</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Your practice profile.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            This is what Wise Care uses to match users to your practice. You decide what's published.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verification Status */}
          <div className="form-section">
            <div className="inner">
              <h3>Verification status</h3>
              <p className="sub">Your profile goes through three steps before listings appear to users. Most providers complete this in 2–3 business days.</p>
              <div className="verify-stages flex flex-col md:flex-row gap-2.5">
                <div className="vs done">
                  <div className="step-dot"><Check className="w-3 h-3 text-emerald-700" /></div>
                  <div>
                    <div className="t">Identity verified</div>
                    <div className="d">Approved 4 days ago</div>
                  </div>
                </div>
                <div className="vs done">
                  <div className="step-dot"><Check className="w-3 h-3 text-emerald-700" /></div>
                  <div>
                    <div className="t">License confirmed</div>
                    <div className="d">Approved 3 days ago</div>
                  </div>
                </div>
                <div className="vs active">
                  <div className="step-dot text-white bg-gradient-to-b from-wise-teal to-wise-teal-deep">3</div>
                  <div>
                    <div className="t">Profile review</div>
                    <div className="d">In review · admin team</div>
                  </div>
                </div>
                <div className="vs">
                  <div className="step-dot">4</div>
                  <div>
                    <div className="t">Listings live</div>
                    <div className="d">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Details */}
          <div className="form-section">
            <div className="inner">
              <h3>Practice details</h3>
              <p className="sub">The information users see on a match card.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Provider or clinic name</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Practice type</label>
                  <select 
                    className="select" 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                  >
                    <option>Individual therapist</option>
                    <option>Group practice / collective</option>
                    <option>Community clinic</option>
                    <option>Psychiatric practice</option>
                    <option>Support group / peer-led</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">License type</label>
                  <select 
                    className="select" 
                    value={licenseType} 
                    onChange={e => setLicenseType(e.target.value)}
                  >
                    <option>LCSW · Licensed Clinical Social Worker</option>
                    <option>LMFT · Licensed Marriage & Family Therapist</option>
                    <option>LPC · Licensed Professional Counselor</option>
                    <option>LPCC · Licensed Professional Clinical Counselor</option>
                    <option>Psy.D. · Doctor of Psychology</option>
                    <option>PMHNP · Psychiatric Nurse Practitioner</option>
                    <option>MD · Medical Doctor / Psychiatrist</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">License number</label>
                  <input 
                    className="input mono" 
                    type="text" 
                    value={licenseNumber} 
                    onChange={e => setLicenseNumber(e.target.value)}
                    required
                  />
                  <span className="field-hint text-wise-muted text-[11px] mt-1 block">Verified privately. Not shown on listings.</span>
                </div>
                <div className="field">
                  <label className="field-label">State of licensure</label>
                  <select 
                    className="select" 
                    value={licenseState} 
                    onChange={e => setLicenseState(e.target.value)}
                  >
                    <option>California</option>
                    <option>Oregon</option>
                    <option>Washington</option>
                    <option>New York</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Years of practice</label>
                  <input 
                    className="input num" 
                    type="text" 
                    value={yearsOfPractice} 
                    onChange={e => setYearsOfPractice(e.target.value)}
                    style={{ maxWidth: '120px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specialties & Approach */}
          <div className="form-section">
            <div className="inner">
              <h3>Specialties &amp; approach</h3>
              <p className="sub">Helps the matching agent surface your profile for relevant care routes.</p>
              
              <div className="tag-row flex flex-wrap gap-2 mb-[18px]">
                {ALL_SPECIALTIES.map(t => {
                  const isSelected = selectedSpecs.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSpecialty(t)}
                      className={`badge cursor-pointer transition-all ${isSelected ? 'teal' : ''}`}
                    >
                      {isSelected && <span className="dot"></span>}
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="field">
                <label className="field-label">Approach (brief)</label>
                <textarea 
                  className="textarea p-3 w-full border border-wise-border rounded-xl text-sm" 
                  value={approach}
                  onChange={e => setApproach(e.target.value)}
                  rows={4}
                  placeholder="A short description of how you work (methods, populations served...)"
                />
              </div>
            </div>
          </div>

          {/* Access & Payment */}
          <div className="form-section">
            <div className="inner">
              <h3>Access &amp; payment</h3>
              <p className="sub">What kinds of users we should match you with.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Insurance accepted</label>
                  <div className="tag-row flex flex-wrap gap-2 mt-1">
                    {ALL_INSURANCES.map(t => {
                      const isSelected = selectedInsurances.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleInsurance(t)}
                          className={`badge cursor-pointer transition-all ${isSelected ? 'teal' : ''}`}
                        >
                          {isSelected && <span className="dot"></span>}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="field">
                  <label className="field-label">Sliding scale</label>
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={slidingScale} 
                        onChange={e => setSlidingScale(e.target.checked)}
                        className="w-4 h-4 rounded border-wise-border text-wise-teal"
                      />
                      <span>I offer sliding scale slots for cost-sensitive clients</span>
                    </label>
                    {slidingScale && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span>Range:</span>
                        <input 
                          type="number" 
                          value={slidingScaleMin} 
                          onChange={e => setSlidingScaleMin(Number(e.target.value))}
                          className="input w-16 p-1 text-center"
                        />
                        <span>to</span>
                        <input 
                          type="number" 
                          value={slidingScaleMax} 
                          onChange={e => setSlidingScaleMax(Number(e.target.value))}
                          className="input w-16 p-1 text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Modality</label>
                  <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['Telehealth', 'In-person', 'Both'] as const).map(o => (
                      <button 
                        key={o}
                        type="button"
                        onClick={() => setModality(o)}
                        className={`choice ${modality === o ? 'selected' : ''}`}
                        style={{ padding: '10px' }}
                      >
                        <span className="check">
                          <Check className="w-3 h-3" />
                        </span>
                        <span className="label" style={{ fontSize: '13px' }}>{o}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Hours typically available</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={hours} 
                    onChange={e => setHours(e.target.value)}
                    placeholder="e.g. Weekday evenings"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="form-section">
            <div className="inner">
              <h3>Contact</h3>
              <p className="sub">Where Wise Care sends referral notifications. Not displayed publicly.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Email</label>
                  <input 
                    className="input" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Phone (optional)</label>
                  <input 
                    className="input" 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User view privacy note */}
          <div className="notice flex gap-3.5 items-start">
            <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
            <div>
              <strong style={{ color: 'var(--fg)' }}>A note on what users see.</strong> Users see your specialty, modality, payment options, and a one-line "why this match" reason. They do not see your license number, internal notes, or the operational details of your verification.
            </div>
          </div>

          {/* Prototype Disclaimer */}
          <Notice variant="standard">
            For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </Notice>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 gap-3 flex-wrap">
            <Link href="/provider/dashboard" className="btn btn-ghost">← Cancel</Link>
            <button type="submit" className="btn btn-primary flex items-center gap-1.5">
              Save profile <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}
