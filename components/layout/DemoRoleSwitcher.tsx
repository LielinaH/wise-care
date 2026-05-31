'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DemoRoleSwitcher() {
  const { role, signIn, isFirebaseMode } = useAuth();

  if (isFirebaseMode) {
    // In Firebase Mode, display the authenticated profile role statically
    let roleLabel = 'Patient';
    if (role === 'solo_provider') roleLabel = 'Solo Clinician';
    else if (role === 'provider_org') roleLabel = 'Clinic Group';
    else if (role === 'admin') roleLabel = 'Operator Admin';

    return (
      <div className="flex flex-col gap-1.5 px-1 py-0.5">
        <span className="text-[10px] font-mono font-medium tracking-[0.16em] uppercase text-wise-muted-2">
          Account Type
        </span>
        <div style={{ padding: '6px 12px', background: 'var(--surface-sunk)', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--fg)', display: 'inline-block', width: 'fit-content' }}>
          {roleLabel}
        </div>
      </div>
    );
  }

  // LocalStorage Fallback Mode role list
  const ROLES = {
    patient: { label: 'User', home: '/dashboard' },
    solo_provider: { label: 'Provider', home: '/provider/solo/dashboard' },
    admin: { label: 'Admin', home: '/admin/dashboard' },
  };

  const handleRoleChange = async (roleKey: keyof typeof ROLES) => {
    const mockEmails = {
      patient: 'patient.demo@wisecare.test',
      solo_provider: 'clinician.demo@wisecare.test',
      admin: 'admin.demo@wisecare.test',
    };
    await signIn(mockEmails[roleKey], 'demo-prototype');
    window.location.href = ROLES[roleKey].home;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-mono font-medium tracking-[0.16em] uppercase text-wise-muted-2 px-1">
        Demo Role
      </div>
      <div className="role-switch" role="tablist" aria-label="Demo role">
        {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map((roleKey) => (
          <button
            key={roleKey}
            className={role === roleKey ? 'active' : ''}
            onClick={() => handleRoleChange(roleKey)}
            type="button"
          >
            {ROLES[roleKey].label}
          </button>
        ))}
      </div>
    </div>
  );
}
