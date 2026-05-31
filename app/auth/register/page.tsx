'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Heart, Users, Building, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, signInWithGoogle, isFirebaseMode } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'solo_provider' | 'provider_org'>('patient');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On success, redirect to dashboard. ProtectedRoute will automatically
      // intercept and send new users without a role to /auth/onboarding
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await register(email, password);
      
      if (isFirebaseMode && res.user) {
        // Automatically determine role from email domain/prefix for ease of dev testing
        let assignedRole: 'patient' | 'provider_org' | 'solo_provider' | 'admin' = role;
        const lowerEmail = email.toLowerCase().trim();
        if (lowerEmail.startsWith('admin') || lowerEmail === 'admin@admin.com') {
          assignedRole = 'admin';
        } else if (lowerEmail.startsWith('user') || lowerEmail === 'user@user.com') {
          assignedRole = 'patient';
        } else if (lowerEmail.startsWith('doc') || lowerEmail.startsWith('clinician') || lowerEmail === 'doc@doc.com') {
          assignedRole = 'solo_provider';
        } else if (lowerEmail.startsWith('clinic') || lowerEmail === 'clinic@clinic.com') {
          assignedRole = 'provider_org';
        }

        // Create the core users/{uid} document
        await firestoreHelpers.setUserProfile(res.user.uid, {
          uid: res.user.uid,
          email: email.toLowerCase().trim(),
          displayName: email.split('@')[0],
          role: assignedRole,
          onboardingComplete: false,
        });
      }

      // Proceed to onboarding wizard
      router.push('/auth/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please make sure Firebase is configured.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page enter">
      
      {/* Left Column: Aside Visual */}
      <aside className="auth-aside">
        <Link className="top" href="/" style={{ cursor: 'pointer' }}>
          <div className="brand-mark"></div>
          <div className="brand-word">
            Wise Care
            <small>Care Navigation</small>
          </div>
        </Link>

        <div className="body">
          <span className="kicker">Create account</span>
          <h1>A safe space to navigate mental health options.</h1>
          <p>
            Wise Care helps you discover mental health resources, match with providers, and compile secure, shareable care packets with zero hassle.
          </p>

          <div className="aside-stats">
            <div className="aside-stat">
              <div className="k">Aggregated stats</div>
              <div className="v">100% private</div>
            </div>
            <div className="aside-stat">
              <div className="k">Network status</div>
              <div className="v num">Live</div>
            </div>
            <div className="aside-stat">
              <div className="k">HIPAA / PHI</div>
              <div className="v text-xs">Demo Prototype</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Form */}
      <main className="auth-main">
        <div className="top-row">
          {'Already have an account? '}
          <Link href="/auth/signin">Sign in</Link>
        </div>

        <div className="auth-card-wrap">
          <div className="auth-card">
            <h2>Create your Wise Care account</h2>
            <p className="sub">
              Your care route is confidential. Select your account type below to get started.
            </p>

            {error && (
              <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '14px' }}>
                {error}
              </div>
            )}

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

            <form className="form-fields" onSubmit={handleSubmit}>
              
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
                
                {role === 'patient' && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                    Access resources, build care packets, and send contact requests to providers.
                  </span>
                )}
                {role === 'solo_provider' && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                    Create practitioner profile, accept referrals, and verify licensure with administrators.
                  </span>
                )}
                {role === 'provider_org' && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                    Register group clinics, telehealth lines, or EAP wellness panels to accept packet requests.
                  </span>
                )}
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
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="inner icon-only">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="privacy-note" style={{ marginTop: '20px', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--hairline)', paddingTop: '14px' }}>
              Admin accounts are pre-seeded for demo evaluations. Use the Admin Quick Access button on the Login screen, or create an account manually in Firestore to test administration views.
            </div>
          </div>
        </div>

        <div className="auth-foot">
          Need urgent help? <Link href="/intake">988 Suicide &amp; Crisis Lifeline</Link> · <Link href="/intake">911 for emergencies</Link>
        </div>
      </main>

    </div>
  );
}
