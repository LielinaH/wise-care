'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Heart, Users, Shield, Building, ArrowRight } from 'lucide-react';

const ROLES = [
  {
    id: 'user',
    title: 'User',
    description: 'Care navigation',
    home: '/dashboard',
    icon: Heart,
  },
  {
    id: 'provider',
    title: 'Provider',
    description: 'Referral inbox',
    home: '/provider/dashboard',
    icon: Users,
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Operations & verification',
    home: '/admin/dashboard',
    icon: Shield,
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('demo-prototype');

  const handleRoleSelection = (roleId: string, home: string) => {
    storage.setRole(roleId);
    router.push(home);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setRole('user');
    router.push('/dashboard');
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
            Wise Care does not diagnose, treat, or prescribe. We help you understand your situation, find options that fit, and prepare for your first appointment.
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
              <div className="k">Crisis routing</div>
              <div className="v">24 / 7</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Form */}
      <main className="auth-main">
        <div className="top-row">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}>
            {isRegister ? 'Sign in' : 'Create one'}
          </a>
        </div>

        <div className="auth-card-wrap">
          <div className="auth-card">
            <h2>{isRegister ? 'Create your Wise Care account' : 'Sign in to Wise Care'}</h2>
            <p className="sub">
              {isRegister 
                ? 'A care route stays private to you until you choose to share it.' 
                : 'Pick a demo role to explore the prototype.'}
            </p>

            <span className="kicker" style={{ display: 'block', marginBottom: '10px' }}>Continue as demo</span>
            <div className="demo-grid">
              {ROLES.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelection(role.id, role.home)}
                    className="demo-card"
                  >
                    <div className="ico">
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div className="role-name">{role.title}</div>
                    <div className="role-sub">{role.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="or-line">OR USE EMAIL</div>

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
                />
              </div>
              <div className="row-between" style={{ marginTop: '2px' }}>
                <label className="check-row">
                  <input type="checkbox" defaultChecked /> Stay signed in
                </label>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '13px', color: 'var(--teal-deep)', fontWeight: 500 }}>
                  Forgot?
                </a>
              </div>

              <button 
                className="btn btn-primary btn-lg" 
                type="submit" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                {isRegister ? 'Create account' : 'Sign In'}
                <span className="inner icon-only">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </form>

            <div className="privacy-note">
              <strong>Your information is used only to create your care route in this prototype.</strong> No data is stored on a server. No personal health information is collected. To clear the demo, sign out and use a new browser session.
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
