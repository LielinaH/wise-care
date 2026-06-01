'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Check, Loader2, ArrowRight, Heart, Users, Building, Shield } from 'lucide-react';

const SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, userProfile, role, isFirebaseMode, signOut } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'patient' | 'solo_provider' | 'provider_org' | 'admin'>('patient');
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const initialName = currentUser.displayName && 
        currentUser.displayName !== 'Org' && 
        currentUser.displayName !== 'Clinic' && 
        currentUser.displayName !== 'Solo' && 
        currentUser.displayName !== 'Patient'
          ? currentUser.displayName 
          : '';
      setDisplayName(initialName);
      setOrgName(initialName);
    }
  }, [currentUser]);

  if (isFirebaseMode && currentUser && !role) {
    const handleRoleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        await firestoreHelpers.setUserProfile(currentUser.uid, {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Google User',
          role: selectedRole,
          onboardingComplete: false,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to select role.');
      }
      setLoading(false);
    };

    return (
      <div className="flex justify-center items-center min-h-screen bg-wise-surface-sunk py-12 px-4 enter">
        <div className="card w-full max-w-[600px] p-8 shadow-2xl">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="brand-mark mx-auto mb-4"></div>
            <h2 className="h2">Select your account type</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginTop: '6px' }}>
              To complete your registration, please select how you will use Wise Care.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRoleSubmit} className="space-y-6">
            <div className="field">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRole('patient')}
                  className={`choice ${selectedRole === 'patient' ? 'selected' : ''}`}
                  style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <Heart className="w-4 h-4 text-wise-teal" />
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>Patient</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole('solo_provider')}
                  className={`choice ${selectedRole === 'solo_provider' ? 'selected' : ''}`}
                  style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <Users className="w-4 h-4 text-wise-teal" />
                  <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>Clinician</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('provider_org')}
                  className={`choice ${selectedRole === 'provider_org' ? 'selected' : ''}`}
                  style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <Building className="w-4 h-4 text-wise-teal" />
                  <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>Clinic / Org</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`choice ${selectedRole === 'admin' ? 'selected' : ''}`}
                  style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <Shield className="w-4 h-4 text-wise-teal" />
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>Admin</span>
                </button>
              </div>

              {selectedRole === 'patient' && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Access resources, build care packets, and send contact requests to providers.
                </span>
              )}
              {selectedRole === 'solo_provider' && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Create practitioner profile, accept referrals, and verify licensure with administrators.
                </span>
              )}
              {selectedRole === 'provider_org' && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Register group clinics, telehealth lines, or EAP wellness panels to accept packet requests.
                </span>
              )}
              {selectedRole === 'admin' && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Access the platform administration dashboard, approve provider credential verifications, and view metrics.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            profile: {
              displayName: displayName.trim(),
              providerTitle: licenseType,
              bio: 'Care navigation provider.',
              profilePhoto: null,
              contactEmail: currentUser.email || '',
              contactPhone: '',
            },
            licensure: {
              licenseType,
              licenseNumberPlaceholder: licenseNumber.trim(),
              licenseState,
              licenseExpirationDate: '',
              licenseDocument: null,
              npiPlaceholder: '',
              telehealthStates: [licenseState],
            },
            careDetails: {
              specialties: selectedSpecs,
              modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
              acceptedCoverageOptions: [],
              selfPayRate: '',
              slidingScaleAvailable: false,
              languages: ['English'],
              availability,
            },
            references: {
              reference1Name: '',
              reference1Relationship: '',
              reference1Email: '',
              reference1Status: 'not_sent',
              reference2Name: '',
              reference2Relationship: '',
              reference2Email: '',
              reference2Status: 'not_sent',
            },
            verification: {
              verificationStatus: 'pending',
              submittedAt: new Date().toISOString(),
              adminNotes: '',
              itemStatuses: {},
              itemNotes: {},
            },
          });
        } else if (role === 'provider_org') {
          // Create clinic profile
          await firestoreHelpers.setProviderOrgProfile(uid, {
            orgId: uid,
            ownerUserId: uid,
            organizationProfile: {
              organizationName: orgName.trim(),
              organizationType: orgType,
              organizationBio: 'Clinic/facility provider.',
              logo: null,
              primaryContactName: '',
              primaryContactEmail: currentUser.email || '',
              primaryContactPhone: '',
              website: '',
            },
            credentialInfo: {
              businessLicensePlaceholder: '',
              licenseState: 'California',
              accreditationPlaceholder: '',
              credentialDocument: null,
            },
            serviceDetails: {
              servicesOffered: [],
              specialties: selectedSpecs,
              modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
              locations: ['California'],
              acceptedCoverageOptions: [],
              slidingScaleAvailable: false,
              availability,
              clinicianCount: 1,
            },
            references: {
              reference1Name: '',
              reference1Relationship: '',
              reference1Email: '',
              reference1Status: 'not_sent',
              reference2Name: '',
              reference2Relationship: '',
              reference2Email: '',
              reference2Status: 'not_sent',
            },
            verification: {
              verificationStatus: 'pending',
              submittedAt: new Date().toISOString(),
              adminNotes: '',
              itemStatuses: {},
              itemNotes: {},
            },
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                    <input
                      className="input"
                      id="availability"
                      type="text"
                      placeholder="e.g. Tue/Wed evenings · 5-8pm"
                      style={{ width: '100%' }}
                      value={availability}
                      onChange={e => setAvailability(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!availability.trim()) return;
                        setIsEnhancing(true);
                        try {
                          const res = await fetch('/api/ai/enhance-hours', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rawHours: availability }),
                          });
                          const data = await res.json();
                          if (data.enhanced) {
                            setAvailability(data.enhanced);
                          }
                        } catch (err) {
                          console.error("Failed to enhance availability:", err);
                        } finally {
                          setIsEnhancing(false);
                        }
                      }}
                      disabled={isEnhancing || !availability.trim()}
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
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--hairline)', marginTop: '22px' }}>
            <button
              type="button"
              onClick={async () => {
                router.push('/');
                setTimeout(async () => {
                  await signOut();
                }, 150);
              }}
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
