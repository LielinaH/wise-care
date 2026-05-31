'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Heart, Users, Shield, Building, ArrowRight, Loader2 } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const DEMO_ACCOUNTS = [
  {
    id: 'patient',
    title: 'Patient Demo',
    email: 'patient.demo@wisecare.test',
    description: 'Care navigation flow',
    icon: Heart,
  },
  {
    id: 'provider_org',
    title: 'Clinic Demo',
    email: 'clinic.demo@wisecare.test',
    description: 'Clinic practice dashboard',
    icon: Building,
  },
  {
    id: 'solo_provider',
    title: 'Clinician Demo',
    email: 'clinician.demo@wisecare.test',
    description: 'Solo provider inbox',
    icon: Users,
  },
  {
    id: 'admin',
    title: 'Admin Demo',
    email: 'admin.demo@wisecare.test',
    description: 'Platform verification queue',
    icon: Shield,
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isFirebaseMode } = useAuth();
  const [email, setEmail] = useState('patient.demo@wisecare.test');
  const [password, setPassword] = useState('demo-prototype');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(demoEmail, 'demo-prototype');
      // On success, redirect depending on role
      const role = res.user?.email?.split('.')[0] || 'patient';
      const target = 
        role === 'patient' 
          ? '/dashboard' 
          : role === 'clinic' 
            ? '/provider/org/dashboard' 
            : role === 'clinician' 
              ? '/provider/solo/dashboard' 
              : role === 'admin' 
                ? '/admin/dashboard' 
                : '/dashboard';
      router.push(target);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. If using Firebase, please make sure this account exists.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(email, password);
      // Wait for AuthProvider profile updates, but we can redirect based on role context
      const userEmail = res.user?.email || '';
      let target = '/dashboard';
      if (userEmail.startsWith('clinic')) target = '/provider/org/dashboard';
      else if (userEmail.startsWith('clinician')) target = '/provider/solo/dashboard';
      else if (userEmail.startsWith('admin')) target = '/admin/dashboard';
      router.push(target);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
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
          <span className="kicker">Welcome back</span>
          <h1>A calm first step toward the right support.</h1>
          <p>
            Wise Care helps you understand your situation, match with options that fit, and prepare for your first visit with clean, structured summaries.
          </p>

          <div className="aside-stats">
            <div className="aside-stat">
              <div className="k">Median intake</div>
              <div className="v num">6 min</div>
            </div>
            <div className="aside-stat">
              <div className="k">Avg. options shown</div>
              <div className="v num">5</div>
            </div>
            <div className="aside-stat">
              <div className="k">Aggregated stats</div>
              <div className="v">100% private</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Form */}
      <main className="auth-main">
        <div className="top-row">
          {"Don't have an account? "}
          <Link href="/auth/register">Create one</Link>
        </div>

        <div className="auth-card-wrap">
          <div className="auth-card">
            <h2>Sign in to Wise Care</h2>
            <p className="sub">
              {isFirebaseMode 
                ? 'Sign in using your account details or select a demo shortcut below.' 
                : 'Running in Local Storage demo mode. Pick a role to explore.'}
            </p>

            {error && (
              <div style={{ padding: '12px', background: 'oklch(92% 0.04 20)', border: '1px solid oklch(80% 0.08 20)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'oklch(40% 0.12 20)', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <span className="kicker" style={{ display: 'block', marginBottom: '10px' }}>Demo Quick Access</span>
            <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '22px' }}>
              {DEMO_ACCOUNTS.map((demo) => {
                const DemoIcon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleDemoSignIn(demo.email)}
                    disabled={loading}
                    className="demo-card"
                    style={{ textAlign: 'left', padding: '14px' }}
                  >
                    <div className="ico" style={{ marginBottom: '8px' }}>
                      <DemoIcon className="w-4 h-4 text-wise-teal-deep" />
                    </div>
                    <div className="role-name" style={{ fontWeight: 600, fontSize: '13.5px' }}>{demo.title}</div>
                    <div className="role-sub" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{demo.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="or-line" style={{ margin: '18px 0', fontSize: '11px', color: 'var(--muted-2)', letterSpacing: '0.12em', textAlign: 'center', position: 'relative' }}>
              OR USE EMAIL CREDENTIALS
            </div>

            <form className="form-fields" onSubmit={handleSubmit}>
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

            <div className="privacy-note" style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--muted)', borderTop: '1px solid var(--hairline)', paddingTop: '14px', lineHeight: 1.55 }}>
              <strong>This is a demo prototype.</strong> Do not enter real medical or personal health information. Wise Care does not diagnose, provide therapy, prescribe medication, or replace a licensed professional.
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
