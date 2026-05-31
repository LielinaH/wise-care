'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProviderDashboardRedirector() {
  const router = useRouter();
  const { role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (role === 'provider_org') {
      router.push('/provider/org/dashboard');
    } else if (role === 'solo_provider') {
      router.push('/provider/solo/dashboard');
    } else {
      router.push('/dashboard');
    }
  }, [role, loading, router]);

  return null;
}
