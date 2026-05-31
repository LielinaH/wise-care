'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'patient' | 'provider_org' | 'solo_provider' | 'admin'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, userProfile, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // 1. If not authenticated, redirect to login
    if (!currentUser) {
      router.push('/auth/signin');
      return;
    }

    // 2. If authenticated but onboarding is not complete, redirect to onboarding
    if (userProfile && !userProfile.onboardingComplete && pathname !== '/auth/onboarding') {
      router.push('/auth/onboarding');
      return;
    }

    // 3. If onboarding is complete but trying to visit onboarding, redirect to dashboard
    if (userProfile && userProfile.onboardingComplete && pathname === '/auth/onboarding') {
      const targetHome = 
        role === 'patient' 
          ? '/dashboard' 
          : role === 'provider_org' 
            ? '/provider/org/dashboard' 
            : role === 'solo_provider' 
              ? '/provider/solo/dashboard' 
              : role === 'admin' 
                ? '/admin/dashboard' 
                : '/dashboard';
      router.push(targetHome);
      return;
    }

    // 4. Role validation
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // User is not authorized to view this page, redirect to their home dashboard
      const targetHome = 
        role === 'patient' 
          ? '/dashboard' 
          : role === 'provider_org' 
            ? '/provider/org/dashboard' 
            : role === 'solo_provider' 
              ? '/provider/solo/dashboard' 
              : role === 'admin' 
                ? '/admin/dashboard' 
                : '/dashboard';
      router.push(targetHome);
    }
  }, [currentUser, userProfile, role, loading, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-wise-surface">
        <Loader2 className="w-10 h-10 text-wise-teal animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
        <p className="text-sm text-wise-muted font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // Double check if page needs rendering or redirecting
  if (!currentUser) return null;
  if (userProfile && !userProfile.onboardingComplete && pathname !== '/auth/onboarding') return null;
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
