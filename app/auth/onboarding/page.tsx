'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Check, Loader2, ArrowRight } from 'lucide-react';

const SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, userProfile, role, isFirebaseMode, signOut } = useAuth();

  const [displayName, setDisplayName] = useState('');
  
  // Solo provider states
  const [licenseType, setLicenseType] = useState('LCSW · Licensed Clinical Social Worker');
  const [licenseState, setLicenseState] = useState('California');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  // Provider Org states
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org'>('group_practice');
  
  // Shared provider states
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Telehealth');
  const [availability, setAvailability] = useState('Weekday evenings');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setOrgName(currentUser.displayName || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const uid = currentUser.uid;

      if (isFirebaseMode) {
        if (role === 'patient') {
          // Create patient document
          await firestoreHelpers.setPatientProfile(uid, {
            userId: uid,
            displayName: displayName.trim(),
            intakeStatus: 'not_started',
            activeCareRouteId: null,
            activeCarePacketId: null,
            activeReferralId: null,
          });
        } else if (role === 'solo_provider') {
          // Create solo provider profile
          await firestoreHelpers.setSoloProviderProfile(uid, {
            userId: uid,
            displayName: displayName.trim(),
            licenseType,
            licenseState,
            licenseNumberPlaceholder: licenseNumber.trim(),
            specialties: selectedSpecs,
            modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
            availability,
            coverageOptions: [],
            verificationStatus: 'pending',
          });

          // Create verification request
          await firestoreHelpers.createVerificationRequest({
            providerType: 'solo_provider',
            providerId: uid,
            submittedBy: currentUser.email || '',
            status: 'pending',
            notes: 'Onboarding license registration',
            createdAt: null,
            updatedAt: null,
          });
        } else if (role === 'provider_org') {
          // Create clinic profile
          await firestoreHelpers.setProviderOrgProfile(uid, {
            orgId: uid,
            ownerUserId: uid,
            organizationName: orgName.trim(),
            organizationType: orgType,
            services: [],
            specialties: selectedSpecs,
            modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
            coverageOptions: [],
            locations: [],
            availability,
            verificationStatus: 'pending',
          });

          // Create verification request
          await firestoreHelpers.createVerificationRequest({
            providerType: 'provider_org',
            providerId: uid,
            submittedBy: currentUser.email || '',
            status: 'pending',
            notes: 'Onboarding clinic registration',
            createdAt: null,
            updatedAt: null,
          });
        }

        // Set onboarding complete
        await firestoreHelpers.setUserProfile(uid, {
          onboardingComplete: true,
          displayName: role === 'patient' || role === 'solo_provider' ? displayName.trim() : orgName.trim(),
        });
      }

      // Redirect depending on role
      const target = 
        role === 'patient' 
          ? '/dashboard' 
          : role === 'provider_org' 
            ? '/provider/org/dashboard' 
            : role === 'solo_provider' 
              ? '/provider/solo/dashboard' 
              : role === 'admin' 
                ? '/admin/dashboard' 
                : '/dashboard';
      
      // Delay slightly for Firestore write to propagate
      setTimeout(() => {
        router.push(target);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Profile setup failed. Please make sure Firebase is fully configured.');
      setLoading(false);
    }
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  if (role === 'admin') {
    // Admins don't need profile onboarding forms
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-wise-surface py-12 px-6 text-center enter">
        <div className="brand-mark mb-6"></div>
        <h2>Administrative Profile Onboarding</h2>
        <p className="text-wise-muted max-w-[420px] text-sm mt-2 mb-6">
          Admin profiles are ready to use immediately. Click below to enter the operations workspace.
        </p>
        <button
          onClick={async () => {
            if (isFirebaseMode && currentUser) {
              await firestoreHelpers.setUserProfile(currentUser.uid, { onboardingComplete: true });
            }
            router.push('/admin/dashboard');
          }}
          className="btn btn-primary"
        >
          Enter Admin Dashboard <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-wise-surface-sunk py-12 px-4 enter">
      <div className="card w-full max-w-[600px] p-8 shadow-2xl">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-mark mx-auto mb-4"></div>
          <h2 className="h2">Complete your profile</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginTop: '6px' }}>
            Set up details to complete the registration process.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {role === 'patient' && (
            <div className="field">
              <label className="field-label" htmlFor="displayName">Your Full Name</label>
              <input
                className="input"
                id="displayName"
                type="text"
                placeholder="Alex Johnson"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          {role === 'solo_provider' && (
            <>
              <div className="field">
                <label className="field-label" htmlFor="displayName">Full Name (including titles)</label>
                <input
                  className="input"
                  id="displayName"
                  type="text"
                  placeholder="Dr. Alex Johnson, Psy.D."
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="field-label">License Type</label>
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
                  <label className="field-label">License State</label>
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
              </div>

              <div className="field">
                <label className="field-label" htmlFor="licenseNumber">License Number</label>
                <input
                  className="input mono"
                  id="licenseNumber"
                  type="text"
                  placeholder="LMF24-091877"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  required
                />
                <span className="field-hint text-wise-muted text-[11px] mt-1 block">Verified securely. Not published to users.</span>
              </div>
            </>
          )}

          {role === 'provider_org' && (
            <>
              <div className="field">
                <label className="field-label" htmlFor="orgName">Organization / Clinic Name</label>
                <input
                  className="input"
                  id="orgName"
                  type="text"
                  placeholder="Quietford Counseling Collective"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Clinic Type</label>
                <select
                  className="select"
                  value={orgType}
                  onChange={e => setOrgType(e.target.value as any)}
                >
                  <option value="group_practice">Group practice / collective</option>
                  <option value="clinic">Outpatient clinic</option>
                  <option value="telehealth_group">Telehealth provider group</option>
                  <option value="community_clinic">Community mental health clinic</option>
                  <option value="support_org">Support group / EAP service</option>
                </select>
              </div>
            </>
          )}

          {(role === 'solo_provider' || role === 'provider_org') && (
            <>
              <div className="field">
                <label className="field-label">Focus Areas / Specialties (Select up to 4)</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {SPECIALTIES.map(s => {
                    const isSelected = selectedSpecs.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        className={`badge cursor-pointer transition-all ${isSelected ? 'teal' : ''}`}
                      >
                        {isSelected && <span className="dot"></span>}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="field-label">Modality</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
                    {(['Telehealth', 'In-person', 'Both'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModality(m)}
                        className={`choice ${modality === m ? 'selected' : ''}`}
                        style={{ padding: '8px', fontSize: '12px' }}
                      >
                        <span className="label">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="availability">Hours Available</label>
                  <input
                    className="input"
                    id="availability"
                    type="text"
                    placeholder="e.g. Tue/Wed evenings · 5-8pm"
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--hairline)', marginTop: '22px' }}>
            <button
              type="button"
              onClick={() => signOut()}
              className="btn btn-ghost"
            >
              Sign out
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving profile...</span>
                </>
              ) : (
                <>
                  <span>Save and continue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
