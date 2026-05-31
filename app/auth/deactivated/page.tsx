'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ShieldAlert, LogOut } from 'lucide-react';

function DeactivatedContent() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      router.push('/');
      setTimeout(async () => {
        await signOut();
      }, 150);
    } catch (e) {
      console.error('Logout failed: ', e);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-wise-surface-sunk py-12 px-4 enter">
      <div className="card w-full max-w-[500px] p-8 shadow-2xl text-center">
        
        {/* Brand/Logo Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div className="brand-mark mx-auto mb-4" style={{ width: '64px', height: '64px' }}></div>
          <div className="brand-word" style={{ fontSize: '1.25rem' }}>
            Wise Care
            <small style={{ fontSize: '9px', marginTop: '2px' }}>Care Navigation</small>
          </div>
        </div>

        {/* Warning Icon & Message */}
        <div className="flex justify-center mb-4">
          <div style={{ padding: '12px', background: 'oklch(95% 0.04 25)', borderRadius: '50%', color: 'var(--danger)' }}>
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        <h2 className="h2" style={{ color: 'var(--fg)', marginBottom: '8px' }}>Account Deactivated</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '24px' }}>
          Your Wise Care account has been deactivated by a system administrator. If you believe this is an error, or if you need to request reactivation, please contact support.
        </p>

        {/* Sign Out Action */}
        <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '20px' }}>
          <button
            onClick={handleSignOut}
            className="btn btn-ghost flex items-center gap-2 mx-auto"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out of account</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function DeactivatedPage() {
  return (
    <ProtectedRoute>
      <DeactivatedContent />
    </ProtectedRoute>
  );
}
