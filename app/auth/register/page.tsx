'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';
import { Heart, Users, Building, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';

const SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];

export default function RegisterPage() {
  const router = useRouter();
  const { register, signIn, signInWithGoogle, isFirebaseMode } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'solo_provider' | 'provider_org'>('patient');
  
  // Profile Details (Step 2)
  const [displayName, setDisplayName] = useState('');
  const [licenseType, setLicenseType] = useState('LCSW · Licensed Clinical Social Worker');
  const [licenseState, setLicenseState] = useState('California');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org'>('group_practice');
  
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Telehealth');
  const [availability, setAvailability] = useState('Weekday evenings');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      
      if (isFirebaseMode && res && res.user) {
        const profile = await firestoreHelpers.getUserProfile(res.user.uid);
        if (!profile) {
          try {
            // Automatically determine role from email domain/prefix for ease of dev testing
            let assignedRole: 'patient' | 'provider_org' | 'solo_provider' | 'admin' = role;
            const userEmail = (res.user.email || '').toLowerCase().trim();
            if (userEmail.startsWith('admin') || userEmail === 'admin@admin.com') {
              assignedRole = 'admin';
            } else if (userEmail.startsWith('user') || userEmail === 'user@user.com') {
              assignedRole = 'patient';
            } else if (userEmail.startsWith('doc') || userEmail.startsWith('clinician') || userEmail === 'doc@doc.com') {
              assignedRole = 'solo_provider';
            } else if (userEmail.startsWith('clinic') || userEmail === 'clinic@clinic.com') {
              assignedRole = 'provider_org';
            }

            // Create the core users/{uid} document with the selected role from registration form UI
            await firestoreHelpers.setUserProfile(res.user.uid, {
              uid: res.user.uid,
              email: res.user.email || '',
              displayName: res.user.displayName || res.user.email?.split('@')[0] || 'Google User',
              role: assignedRole,
              onboardingComplete: false,
            });
          } catch (firestoreError) {
            console.error("Google registration profile setup failed. Rolling back Auth account:", firestoreError);
            try {
              await res.user.delete();
            } catch (deleteError) {
              console.error("Auth rollback failed for Google registration:", deleteError);
            }
            throw firestoreError;
          }
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate Step 2 details
    if (role === 'patient' && !displayName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }
    if (role === 'solo_provider') {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!licenseNumber.trim()) {
        setError('Please enter your license number.');
        setLoading(false);
        return;
      }
      if (!availability.trim()) {
        setError('Please enter your hours available.');
        setLoading(false);
        return;
      }
    }
    if (role === 'provider_org') {
      if (!orgName.trim()) {
        setError('Please enter your organization name.');
        setLoading(false);
        return;
      }
      if (!availability.trim()) {
        setError('Please enter your hours available.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isFirebaseMode) {
        // Call the server-side atomic registration API
        const apiResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role,
            displayName,
            licenseType,
            licenseState,
            licenseNumber,
            orgName,
            orgType,
            selectedSpecs,
            modality,
            availability,
          }),
        });

        const apiData = await apiResponse.json();
        if (!apiResponse.ok || apiData.error) {
          throw new Error(apiData.error || 'Registration failed.');
        }

        // Authenticate client-side with Firebase Auth
        await signIn(email, password);
      } else {
        // Fallback local storage mode
        await register(email, password, role);
      }

      const target = 
        role === 'patient' 
          ? '/dashboard' 
          : role === 'provider_org' 
            ? '/provider/org/dashboard' 
            : role === 'solo_provider' 
              ? '/provider/solo/dashboard' 
              : '/dashboard';
      
      router.push(target);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  return (
    <div className="auth-page enter">
      <div className="auth-card-wrap">
        <div className="auth-card" style={{ maxWidth: '600px', width: '100%' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="brand-mark" style={{ width: '48px', height: '48px' }}></div>
              <div className="brand-word" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontSize: '1.2rem' }}>
                Wise Care
                <small style={{ fontSize: '10px', marginTop: '2px' }}>Care Navigation</small>
              </div>
            </Link>
          </div>

          <h2>Create your Wise Care account</h2>
          <p className="sub" style={{ marginBottom: '16px' }}>
            Step {step} of 2: {step === 1 ? 'Account Credentials' : 'Complete Profile'}
          </p>

          {error && (
            <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep}>
              <button 
                type="button" 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="btn btn-soft btn-lg" 
                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
              >
                <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="or-line" style={{ margin: '14px 0 20px', fontSize: '11px', color: 'var(--muted-2)', letterSpacing: '0.12em', textAlign: 'center', position: 'relative' }}>
                OR SIGN UP WITH EMAIL
              </div>

              <div className="form-fields">
                {/* Account Type Selector */}
                <div className="field">
                  <label className="field-label">Account type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`choice ${role === 'patient' ? 'selected' : ''}`}
                      style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <Heart className="w-4 h-4 text-wise-teal" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Patient</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRole('solo_provider')}
                      className={`choice ${role === 'solo_provider' ? 'selected' : ''}`}
                      style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <Users className="w-4 h-4 text-wise-teal" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Solo Clinician</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('provider_org')}
                      className={`choice ${role === 'provider_org' ? 'selected' : ''}`}
                      style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <Building className="w-4 h-4 text-wise-teal" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Clinic / Org</span>
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="email">Email</label>
                  <input 
                    className="input" 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="field">
                  <label className="field-label" htmlFor="password">Password</label>
                  <input 
                    className="input" 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  className="btn btn-primary btn-lg" 
                  type="submit" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          ) : (
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
                        className="select pr-10"
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
                        className="select pr-10"
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
                      <div className="flex gap-2 mt-1">
                        {(['Telehealth', 'In-person', 'Both'] as const).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setModality(m)}
                            className={`choice ${modality === m ? 'selected' : ''}`}
                            style={{ 
                              padding: '8px 4px', 
                              fontSize: '12px', 
                              flex: 1, 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span className="label" style={{ fontSize: '12px', fontWeight: 500 }}>{m}</span>
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

              <div style={{ display: 'flex', gap: '12px', paddingTop: '18px', borderTop: '1px solid var(--hairline)', marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-soft"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <Check className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13.5px', color: 'var(--fg-soft)', borderTop: '1px solid var(--hairline)', paddingTop: '16px' }}>
            {"Already have an account? "}
            <Link href="/auth/signin" style={{ color: 'var(--teal-deep)', fontWeight: 600 }}>Sign in</Link>
          </div>

        </div>
      </div>

      <div className="auth-foot">
        Need urgent help? <Link href="/intake">988 Suicide &amp; Crisis Lifeline</Link> · <Link href="/intake">911 for emergencies</Link>
      </div>

    </div>
  );
}

