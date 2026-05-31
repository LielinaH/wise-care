'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';
import { Heart, Users, Shield, Building, ArrowRight, Loader2 } from 'lucide-react';
import Notice from '@/components/ui/Notice';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isFirebaseMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(email, password);
      
      let target = '/dashboard';
      if (isFirebaseMode && res.user) {
        const profile = await firestoreHelpers.getUserProfile(res.user.uid);
        const role = profile?.role;
        const userEmail = res.user.email || '';
        
        if (role === 'provider_org' || userEmail.startsWith('clinic')) {
          target = '/provider/org/dashboard';
        } else if (role === 'solo_provider' || userEmail.startsWith('clinician') || userEmail.startsWith('doc')) {
          target = '/provider/solo/dashboard';
        } else if (role === 'admin' || userEmail.startsWith('admin')) {
          target = '/admin/dashboard';
        } else {
          target = '/dashboard';
        }
      } else {
        const userEmail = res.user?.email || '';
        if (userEmail.startsWith('clinic')) target = '/provider/org/dashboard';
        else if (userEmail.startsWith('clinician')) target = '/provider/solo/dashboard';
        else if (userEmail.startsWith('admin')) target = '/admin/dashboard';
      }
      
      router.push(target);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page enter">
      <div className="auth-card-wrap">
        <div className="auth-card">
          
          {/* Logo inside card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div className="brand-mark" style={{ width: '64px', height: '64px' }}></div>
              <div className="brand-word" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontSize: '1.3rem' }}>
                Wise Care
                <small style={{ fontSize: '10px', marginTop: '3px' }}>Care Navigation</small>
              </div>
            </Link>
          </div>

          <h2>Sign in to Wise Care</h2>
          <p className="sub" style={{ marginBottom: '20px' }}>
            Your secure space for professional care navigation, resource matching, and mental health support.
          </p>

          {!isFirebaseMode && (
            <Notice variant="brand" className="mb-4">
              <strong>Demo Local Mode Active:</strong> You can enter any mock email (e.g. <code>user@user.com</code>, <code>doc@doc.com</code>, <code>admin@admin.com</code>) to simulate a sign-in.
            </Notice>
          )}

          {error && (
            <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {/* Google Sign-in Button at the Top */}
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

          <div className="or-line" style={{ margin: '20px 0', fontSize: '11px', color: 'var(--muted-2)', letterSpacing: '0.12em', textAlign: 'center', position: 'relative' }}>
            OR SIGN IN WITH EMAIL
          </div>

          {/* Email Form fields */}
          <form className="form-fields" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="email">Email Address</label>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="inner icon-only">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Create account link at the bottom of the card */}
          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13.5px', color: 'var(--fg-soft)', borderTop: '1px solid var(--hairline)', paddingTop: '16px' }}>
            {"Don't have an account? "}
            <Link href="/auth/register" style={{ color: 'var(--teal-deep)', fontWeight: 600 }}>Create one</Link>
          </div>

        </div>
      </div>

      <div className="auth-foot">
        Need urgent help? <Link href="/intake">988 Suicide &amp; Crisis Lifeline</Link> · <Link href="/intake">911 for emergencies</Link>
      </div>

    </div>
  );
}

