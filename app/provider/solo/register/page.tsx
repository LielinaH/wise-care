'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Check, Info, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ALL_SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];
const ALL_INSURANCES = ['Aetna', 'BCBS', 'Cigna', 'United', 'Self-pay', 'Marketplace Plan'];

function SoloProviderRegisterContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [licenseType, setLicenseType] = useState('LMFT');
  const [licenseState, setLicenseState] = useState('California');
  const [licensePlaceholder, setLicensePlaceholder] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Telehealth');
  const [hours, setHours] = useState('Tue / Wed / Thu evenings');
  const [verificationStatus, setVerificationStatus] = useState<'draft' | 'pending' | 'verified' | 'rejected'>('draft');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          const profile = await firestoreHelpers.getSoloProviderProfile(currentUser.uid);
          if (profile) {
            setDisplayName(profile.displayName || '');
            setLicenseType(profile.licenseType || 'LMFT');
            setLicenseState(profile.licenseState || 'California');
            setLicensePlaceholder(profile.licenseNumberPlaceholder || '');
            setSelectedSpecs(profile.specialties || []);
            setSelectedInsurances(profile.coverageOptions || []);
            setHours(profile.availability || 'Accepting new clients');
            setVerificationStatus(profile.verificationStatus || 'draft');
            if (profile.modalities && profile.modalities.length > 0) {
              if (profile.modalities.includes('Telehealth') && profile.modalities.includes('In-person')) {
                setModality('Both');
              } else if (profile.modalities.includes('Telehealth')) {
                setModality('Telehealth');
              } else {
                setModality('In-person');
              }
            }
          }
        } catch (e) {
          console.error("Error loading solo provider profile:", e);
        }
      } else {
        // Fallback
        const p = storage.getStorageItem<any>('wisecare.providers.solo', null);
        if (p) {
          setDisplayName(p.displayName || '');
          setLicenseType(p.licenseType || 'LMFT');
          setLicenseState(p.licenseState || 'California');
          setLicensePlaceholder(p.licenseNumberPlaceholder || '');
          setSelectedSpecs(p.specialties || []);
          setSelectedInsurances(p.coverageOptions || []);
          setHours(p.availability || 'Accepting new clients');
          setVerificationStatus(p.verificationStatus || 'draft');
        } else {
          setDisplayName('Demo Clinician');
          setSelectedSpecs(['Anxiety', 'Sleep']);
          setSelectedInsurances(['Private Plan A']);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [currentUser, isFirebaseMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const profileData = {
      userId: currentUser.uid,
      displayName,
      licenseType,
      licenseState,
      licenseNumberPlaceholder: licensePlaceholder,
      specialties: selectedSpecs,
      modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
      coverageOptions: selectedInsurances,
      availability: hours,
      verificationStatus: verificationStatus === 'draft' ? 'pending' : verificationStatus,
    };

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setSoloProviderProfile(currentUser.uid, profileData);
        // Create verification request automatically if status is draft/pending
        if (verificationStatus === 'draft') {
          await firestoreHelpers.createVerificationRequest({
            providerType: 'solo_provider',
            providerId: currentUser.uid,
            submittedBy: currentUser.email || 'unknown',
            status: 'pending',
            notes: 'Initial profile submit for validation.',
            createdAt: null,
            updatedAt: null,
          });
        }
      } catch (e) {
        console.error("Error saving solo provider profile:", e);
      }
    } else {
      storage.setStorageItem('wisecare.providers.solo', profileData);
    }

    setToastMsg('Profile details submitted successfully');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/solo/dashboard');
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

  if (loading) {
    return (
      <AppShell title="Clinician Profile" crumbs={['Practice', 'Profile']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading profile details...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Clinician Profile" 
      crumbs={['Practice', 'Profile']}
      actions={
        <Link href="/provider/solo/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</Link>
      }
    >
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="reg-wrap enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Clinician Settings</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Edit practice parameters</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Customize focus issues, modalities, licensing, and insurance options. These values filter your patient match compatibilities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verification Status */}
          <div className="form-section">
            <div className="inner">
              <h3>Verification status</h3>
              <p className="sub">Platform audits check licensing coordinates prior to publishing directory matches.</p>
              <div className="verify-stages flex flex-col md:flex-row gap-2.5">
                <div className={`vs ${verificationStatus !== 'draft' ? 'done' : 'active'}`}>
                  <div className="step-dot">
                    {verificationStatus !== 'draft' ? <Check className="w-3 h-3 text-emerald-700" /> : '1'}
                  </div>
                  <div>
                    <div className="t">Submit profile</div>
                    <div className="d">{verificationStatus !== 'draft' ? 'Completed' : 'Action needed'}</div>
                  </div>
                </div>
                <div className={`vs ${verificationStatus === 'verified' ? 'done' : (verificationStatus === 'pending' ? 'active' : '')}`}>
                  <div className="step-dot">
                    {verificationStatus === 'verified' ? <Check className="w-3 h-3 text-emerald-700" /> : '2'}
                  </div>
                  <div>
                    <div className="t">Admin credential check</div>
                    <div className="d">{verificationStatus === 'verified' ? 'Approved' : (verificationStatus === 'pending' ? 'Pending audit' : 'Awaiting submit')}</div>
                  </div>
                </div>
                <div className={`vs ${verificationStatus === 'verified' ? 'active' : ''}`}>
                  <div className="step-dot">{verificationStatus === 'verified' ? <Check className="w-3 h-3 text-emerald-700" /> : '3'}</div>
                  <div>
                    <div className="t">Matching live</div>
                    <div className="d">{verificationStatus === 'verified' ? 'Active in directory' : 'Pending credential approval'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="form-section">
            <div className="inner">
              <h3>Practice details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Professional Name</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">License Type</label>
                  <select 
                    className="select" 
                    value={licenseType} 
                    onChange={e => setLicenseType(e.target.value)}
                  >
                    <option>LMFT · Marriage & Family Therapist</option>
                    <option>LCSW · Clinical Social Worker</option>
                    <option>LPC · Professional Counselor</option>
                    <option>Psy.D. / Ph.D. · Licensed Psychologist</option>
                    <option>PMHNP · Psychiatric Nurse Practitioner</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">State of Licensure</label>
                  <select 
                    className="select" 
                    value={licenseState} 
                    onChange={e => setLicenseState(e.target.value)}
                  >
                    <option>California</option>
                    <option>Oregon</option>
                    <option>Washington</option>
                    <option>Texas</option>
                    <option>New York</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">License Number</label>
                  <input 
                    className="input mono" 
                    type="text" 
                    value={licensePlaceholder} 
                    onChange={e => setLicensePlaceholder(e.target.value)}
                    required
                    placeholder="e.g. LMF24-0918"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Focus */}
          <div className="form-section">
            <div className="inner">
              <h3>Clinical specialties</h3>
              <p className="sub">Toggle support issues you focus on in your practice.</p>
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
            </div>
          </div>

          {/* Access */}
          <div className="form-section">
            <div className="inner">
              <h3>Payment &amp; meeting formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Insurances Accepted</label>
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
                  <label className="field-label">Meeting modality</label>
                  <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['Telehealth', 'In-person', 'Both'] as const).map(o => (
                      <button 
                        key={o}
                        type="button"
                        onClick={() => setModality(o)}
                        className={`choice ${modality === o ? 'selected' : ''}`}
                        style={{ padding: '10px' }}
                      >
                        <span className="label" style={{ fontSize: '13px' }}>{o}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Available hours description</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={hours} 
                    onChange={e => setHours(e.target.value)}
                    placeholder="e.g. Weekday evenings · 5-8pm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Alert */}
          <div className="notice flex gap-3.5 items-start">
            <Lock className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
            <div>
              <strong style={{ color: 'var(--fg)' }}>Administrative safety checks.</strong> Clinicians must be verified. This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not verify licenses or claims in this demo space.
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex justify-between items-center pt-4 gap-3 flex-wrap">
            <Link href="/provider/solo/dashboard" className="btn btn-ghost">← Cancel</Link>
            <button type="submit" className="btn btn-primary flex items-center gap-1.5">
              Save clinician parameters <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}

export default function SoloProviderRegister() {
  return (
    <ProtectedRoute allowedRoles={['solo_provider']}>
      <SoloProviderRegisterContent />
    </ProtectedRoute>
  );
}
