'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Check, Info, Lock, ArrowRight, ArrowLeft, Loader2, Building } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ALL_SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];
const ALL_INSURANCES = ['Aetna', 'BCBS', 'Cigna', 'United', 'Public Coverage', 'Sliding scale', 'Self-pay'];

function OrgProviderRegisterContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();

  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org'>('group_practice');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Both');
  const [hours, setHours] = useState('Accepting new clients');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'draft' | 'pending' | 'verified' | 'rejected'>('draft');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          const profile = await firestoreHelpers.getProviderOrgProfile(currentUser.uid);
          if (profile) {
            setOrganizationName(profile.organizationName || '');
            setOrganizationType(profile.organizationType || 'group_practice');
            setSelectedSpecs(profile.specialties || []);
            setSelectedInsurances(profile.coverageOptions || []);
            setHours(profile.availability || 'Accepting new clients');
            setServices(profile.services || []);
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
          console.error("Error loading org profile:", e);
        }
      } else {
        const o = storage.getStorageItem<any>('wisecare.providers.org', null);
        if (o) {
          setOrganizationName(o.organizationName || '');
          setOrganizationType(o.organizationType || 'group_practice');
          setSelectedSpecs(o.specialties || []);
          setSelectedInsurances(o.coverageOptions || []);
          setHours(o.availability || 'Accepting new clients');
          setServices(o.services || []);
          setVerificationStatus(o.verificationStatus || 'draft');
        } else {
          setOrganizationName('Quietford Counseling Collective');
          setSelectedSpecs(['Anxiety', 'Relationships']);
          setSelectedInsurances(['BCBS', 'Self-pay']);
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
      orgId: currentUser.uid,
      ownerUserId: currentUser.uid,
      organizationName,
      organizationType,
      verificationStatus: verificationStatus === 'draft' ? 'pending' : verificationStatus,
      services: services.length > 0 ? services : ['Psychological Services'],
      specialties: selectedSpecs,
      modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
      coverageOptions: selectedInsurances,
      locations: ['California'],
      availability: hours,
    };

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setProviderOrgProfile(currentUser.uid, profileData);
        if (verificationStatus === 'draft') {
          await firestoreHelpers.createVerificationRequest({
            providerType: 'provider_org',
            providerId: currentUser.uid,
            submittedBy: currentUser.email || 'unknown',
            status: 'pending',
            notes: 'Clinic registration check.',
            createdAt: null,
            updatedAt: null,
          });
        }
      } catch (e) {
        console.error("Error saving org profile:", e);
      }
    } else {
      storage.setStorageItem('wisecare.providers.org', profileData);
    }

    setToastMsg('Clinic profile submitted successfully');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/org/dashboard');
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
      <AppShell title="Clinic Settings" crumbs={['Practice', 'Clinic Settings']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading clinic details...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Clinic Settings" 
      crumbs={['Practice', 'Clinic Settings']}
      actions={
        <button onClick={() => router.push('/provider/org/dashboard')} className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</button>
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
          <span className="kicker">Clinic profile settings</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Edit clinic parameters</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Customize your clinical collective matches, insurance covers, and intake status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verification Status */}
          <div className="form-section">
            <div className="inner">
              <h3>Verification status</h3>
              <p className="sub">Platform audits check licensing coordinates prior to clinic publication.</p>
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
                    <div className="t">Admin check</div>
                    <div className="d">{verificationStatus === 'verified' ? 'Approved' : (verificationStatus === 'pending' ? 'Pending audit' : 'Awaiting submit')}</div>
                  </div>
                </div>
                <div className={`vs ${verificationStatus === 'verified' ? 'active' : ''}`}>
                  <div className="step-dot">{verificationStatus === 'verified' ? <Check className="w-3 h-3 text-emerald-700" /> : '3'}</div>
                  <div>
                    <div className="t">Clinic listings live</div>
                    <div className="d">{verificationStatus === 'verified' ? 'Active in directory' : 'Pending verification approval'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="form-section">
            <div className="inner">
              <h3>Clinic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Clinic/Organization Name</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={organizationName} 
                    onChange={e => setOrganizationName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Organization Type</label>
                  <select 
                    className="select" 
                    value={organizationType} 
                    onChange={e => setOrganizationType(e.target.value as any)}
                  >
                    <option value="group_practice">Group practice / collective</option>
                    <option value="clinic">Outpatient clinic</option>
                    <option value="hospital">Hospital system</option>
                    <option value="telehealth_group">Telehealth group</option>
                    <option value="community_clinic">Community clinic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="form-section">
            <div className="inner">
              <h3>Clinic specialties</h3>
              <p className="sub">Toggle support issues your clinicians specialize in.</p>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                    <input 
                      className="input" 
                      type="text" 
                      style={{ width: '100%' }}
                      value={hours} 
                      onChange={e => setHours(e.target.value)}
                      placeholder="e.g. Weekday evenings · 5-8pm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!hours.trim()) return;
                        setIsEnhancing(true);
                        try {
                          const res = await fetch('/api/ai/enhance-hours', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rawHours: hours }),
                          });
                          const data = await res.json();
                          if (data.enhanced) {
                            setHours(data.enhanced);
                          }
                        } catch (err) {
                          console.error("Failed to enhance availability:", err);
                        } finally {
                          setIsEnhancing(false);
                        }
                      }}
                      disabled={isEnhancing || !hours.trim()}
                      className="btn btn-soft"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Cleaning...</span>
                        </>
                      ) : (
                        '✨ AI Enhance'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Alert */}
          <div className="notice flex gap-3.5 items-start">
            <Lock className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
            <div>
              <strong style={{ color: 'var(--fg)' }}>Administrative safety checks.</strong> Clinics must be verified. This is a demo prototype. Do not enter real medical or personal health information. Wise Care does not verify clinic licenses or claims in this demo space.
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex justify-between items-center pt-4 gap-3 flex-wrap">
            <button type="button" onClick={() => router.push('/provider/org/dashboard')} className="btn btn-ghost flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-1.5">
              Save clinic settings <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}

export default function OrgProviderRegister() {
  return (
    <ProtectedRoute allowedRoles={['provider_org']}>
      <OrgProviderRegisterContent />
    </ProtectedRoute>
  );
}
