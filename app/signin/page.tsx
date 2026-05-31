'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { User, Shield, Stethoscope, BarChart3, ChevronRight } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ROLES = [
  {
    id: 'user',
    title: 'Individual Seeking Care',
    description: 'Find a care route, match with providers, and prepare your shareable Care Packet.',
    home: '/dashboard',
    icon: User,
  },
  {
    id: 'provider',
    title: 'Care Provider / Clinic',
    description: 'Verify your credentials, manage your profile, and receive structured referrals.',
    home: '/provider/dashboard',
    icon: Stethoscope,
  },
  {
    id: 'admin',
    title: 'Platform Administrator',
    description: 'Verify clinicians, monitor high-risk routing safety, and view matching metrics.',
    home: '/admin/dashboard',
    icon: Shield,
  },
  {
    id: 'org',
    title: 'Enterprise Partner (Org)',
    description: 'Monitor aggregate access barriers and support demand trends. Anonymous data only.',
    home: '/organization/insights',
    icon: BarChart3,
  },
];

export default function SignInPage() {
  const router = useRouter();

  const handleRoleSelection = (roleId: string, home: string) => {
    storage.setRole(roleId);
    router.push(home);
  };

  return (
    <div className="bg-wise-bg text-wise-fg min-h-screen flex flex-col font-sans">
      {/* Small Navbar */}
      <nav className="border-b border-wise-hairline py-4 bg-wise-surface">
        <div className="container max-w-[1240px] mx-auto px-6 flex items-center justify-between">
          <Link className="flex items-center gap-2 cursor-pointer" href="/">
            <div className="brand-mark w-7 h-7"></div>
            <div className="brand-word text-sm">
              Wise Care
              <small>Care Navigation</small>
            </div>
          </Link>
          <Link href="/" className="text-xs text-wise-muted hover:text-wise-fg">
            Back to home
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-[480px] w-full enter">
          <div className="text-center mb-8">
            <span className="kicker">Prototype Environment</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-wise-fg mt-3">
              Select your role
            </h2>
            <p className="text-sm text-wise-muted mt-2">
              Select one of the simulated roles below to access the respective dashboard of the Wise Care platform.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelection(role.id, role.home)}
                  className="flex items-start gap-4 p-5 bg-wise-surface border border-wise-border hover:border-wise-border-2 rounded-2xl text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-wise-teal-soft text-wise-teal-deep flex items-center justify-center shrink-0 group-hover:bg-wise-teal group-hover:text-white transition-colors">
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] flex items-center justify-between">
                      {role.title}
                      <ChevronRight className="w-4 h-4 text-wise-muted group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs text-wise-muted mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <Notice variant="brand" className="mt-8" title="Demo Environment">
            No credentials are required for this check-in. For this prototype, your information is stored locally in this browser session. Nothing is shared unless you explicitly choose to send a simulated connection request.
          </Notice>
        </div>
      </div>
    </div>
  );
}
