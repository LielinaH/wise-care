'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';

const ROLES = {
  user: { label: 'User', home: '/dashboard' },
  provider: { label: 'Provider', home: '/provider/dashboard' },
  admin: { label: 'Admin', home: '/admin/dashboard' },
};

export default function DemoRoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<string>('user');

  useEffect(() => {
    setCurrentRole(storage.getRole());
  }, [pathname]);

  const handleRoleChange = (role: keyof typeof ROLES) => {
    storage.setRole(role);
    setCurrentRole(role);
    router.push(ROLES[role].home);
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
            className={currentRole === roleKey ? 'active' : ''}
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
