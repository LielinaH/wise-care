'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Search, UserCheck, ShieldAlert, Heart, Users, Building, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AccountRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient' | 'provider_org' | 'solo_provider' | 'admin';
  onboardingComplete: boolean;
  disabled?: boolean;
  extraInfo?: string;
}

function AdminAccountsContent() {
  const { isFirebaseMode } = useAuth();
  const [users, setUsers] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      if (isFirebaseMode) {
        const allUsers = await firestoreHelpers.getAllUsers();
        const { solo, org } = await firestoreHelpers.getAllProviders();
        
        // Map user profiles to include their associated provider/patient details
        const joined: AccountRecord[] = allUsers.map(u => {
          let extraInfo = '';
          if (u.role === 'solo_provider') {
            const soloProf = solo.find(s => s.userId === u.uid);
            if (soloProf) {
              extraInfo = `License: ${soloProf.licenseType} (${soloProf.licenseState} #${soloProf.licenseNumberPlaceholder})`;
            } else {
              extraInfo = 'Awaiting clinician profile setup';
            }
          } else if (u.role === 'provider_org') {
            const orgProf = org.find(o => o.orgId === u.uid);
            if (orgProf) {
              extraInfo = `Clinic: ${orgProf.organizationName || 'Unnamed'} (${(orgProf.organizationType || '').replace('_', ' ')})`;
            } else {
              extraInfo = 'Awaiting clinic profile setup';
            }
          } else if (u.role === 'patient') {
            extraInfo = 'Patient care route and packets managed securely';
          }
          return {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || 'Unnamed User',
            role: u.role,
            onboardingComplete: u.onboardingComplete,
            disabled: u.disabled || false,
            extraInfo,
          };
        });
        setUsers(joined);
      } else {
        // Local storage demo mode
        let storedUsers = storage.getStorageItem<AccountRecord[]>('wisecare.demoUsers', []);
        if (storedUsers.length === 0) {
          storedUsers = [
            { uid: 'u1', email: 'user@user.com', displayName: 'User Patient', role: 'patient', onboardingComplete: true, disabled: false, extraInfo: 'Patient care route and packets managed securely' },
            { uid: 'u2', email: 'doc@doc.com', displayName: 'Dr. Jane Smith, Psy.D.', role: 'solo_provider', onboardingComplete: true, disabled: false, extraInfo: 'License: Psy.D. (California #90123)' },
            { uid: 'u3', email: 'clinic@clinic.com', displayName: 'Quietford Practice Group', role: 'provider_org', onboardingComplete: true, disabled: false, extraInfo: 'Clinic: Quietford Counseling (group practice)' },
            { uid: 'u4', email: 'admin@admin.com', displayName: 'System Admin', role: 'admin', onboardingComplete: true, disabled: false, extraInfo: 'Platform Operations Administrator' },
            { uid: 'u5', email: 'lielina@gmail.com', displayName: 'Lielina Haile', role: 'patient', onboardingComplete: true, disabled: false, extraInfo: 'Patient care route and packets managed securely' },
          ];
          storage.setStorageItem('wisecare.demoUsers', storedUsers);
        }
        const normalized = storedUsers.map(su => ({ ...su, disabled: su.disabled || false }));
        setUsers(normalized);
      }
    } catch (e) {
      console.error('Error loading account database:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, [isFirebaseMode]);

  const handleRoleChange = async (uid: string, newRole: AccountRecord['role'], email: string) => {
    const actionWord = newRole === 'admin' ? 'ESCALATE to ADMIN' : `change the role to '${newRole}'`;
    const ok = window.confirm(`Are you sure you want to ${actionWord} for the account ${email}?`);
    if (!ok) return;

    try {
      if (isFirebaseMode) {
        await firestoreHelpers.updateUserRole(uid, newRole);
      } else {
        const updated = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
        storage.setStorageItem('wisecare.demoUsers', updated);
      }
      setSuccessMessage(`Account ${email} successfully updated to role '${newRole}'`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadAccounts();
    } catch (err: any) {
      alert(`Error updating role: ${err.message || 'Operation failed'}`);
    }
  };

  const handleToggleDeactivate = async (uid: string, currentDisabled: boolean, email: string) => {
    const actionWord = currentDisabled ? 'reactivate' : 'deactivate';
    const ok = window.confirm(`Are you sure you want to ${actionWord} the account ${email}?`);
    if (!ok) return;

    try {
      if (isFirebaseMode) {
        await firestoreHelpers.updateUserDisabled(uid, !currentDisabled);
      } else {
        const updated = users.map(u => u.uid === uid ? { ...u, disabled: !currentDisabled } : u);
        storage.setStorageItem('wisecare.demoUsers', updated);
      }
      setSuccessMessage(`Account ${email} successfully ${currentDisabled ? 'reactivated' : 'deactivated'}`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadAccounts();
    } catch (err: any) {
      alert(`Error updating account status: ${err.message || 'Operation failed'}`);
    }
  };

  const handleDeleteAccount = async (uid: string, email: string, role: string) => {
    const ok = window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE the account ${email}? This will delete all associated Firestore documents and Firebase Auth credentials.`);
    if (!ok) return;

    try {
      if (isFirebaseMode) {
        // Delete user (both Auth and Firestore) via server-side API to prevent half-deleted states
        const res = await fetch('/api/admin/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete user account.');
        }
      } else {
        const updated = users.filter(u => u.uid !== uid);
        storage.setStorageItem('wisecare.demoUsers', updated);
      }
      setSuccessMessage(`Account ${email} successfully deleted`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadAccounts();
    } catch (err: any) {
      alert(`Error deleting account: ${err.message || 'Operation failed'}`);
    }
  };


  const getRoleBadge = (role: AccountRecord['role']) => {
    switch (role) {
      case 'admin':
        return <span className="badge danger flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Admin</span>;
      case 'solo_provider':
        return <span className="badge teal flex items-center gap-1"><Users className="w-3 h-3" /> Clinician</span>;
      case 'provider_org':
        return <span className="badge blue flex items-center gap-1"><Building className="w-3 h-3" /> Clinic / Org</span>;
      case 'patient':
        return <span className="badge success flex items-center gap-1"><Heart className="w-3 h-3" /> Patient</span>;
      default:
        return <span className="badge flex items-center gap-1"><HelpCircle className="w-3 h-3" /> User</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.uid.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <AppShell title="Account Database" crumbs={['Operations', 'Accounts']}>
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Title block */}
        <div>
          <span className="kicker">Admin Console</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Manage User Accounts</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Escalate accounts to administrators, re-verify clinical profiles, and audit platform membership.
          </p>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div className="notice success flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-wise-success shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Controls row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <div className="field" style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Search email, name, or UID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search className="w-4 h-4 text-wise-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fg-soft)' }}>Filter Role:</span>
            <select
              className="select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13.5px' }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="solo_provider">Clinicians (Solo)</option>
              <option value="provider_org">Clinics / Organizations</option>
              <option value="patient">Patients</option>
            </select>
          </div>
        </div>

        {/* Database Table */}
        <div className="card elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="spin w-8 h-8 border-2 border-wise-teal border-t-transparent rounded-full" />
              <span className="text-sm text-wise-muted">Loading account index...</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-sunk)', borderBottom: '1px solid var(--hairline)', color: 'var(--fg-soft)', fontWeight: 600 }}>
                    <th style={{ padding: '14px 18px' }}>User Details</th>
                    <th style={{ padding: '14px 18px' }}>Account ID</th>
                    <th style={{ padding: '14px 18px' }}>System Role</th>
                    <th style={{ padding: '14px 18px' }}>Onboarding</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Role Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wise-hairline">
                  {filteredUsers.map((u) => (
                    <tr 
                      key={u.uid} 
                      style={{ borderBottom: '1px solid var(--hairline)', transition: 'background var(--t-fast)' }}
                      className="hover:bg-wise-surface-2"
                    >
                      {/* User Details */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            fontWeight: 600, 
                            color: u.disabled ? 'var(--muted)' : 'var(--fg)',
                            textDecoration: u.disabled ? 'line-through' : 'none' 
                          }}>
                            {u.displayName}
                          </div>
                          {u.disabled && (
                            <span className="badge danger" style={{ fontSize: '9.5px', padding: '2px 6px' }}>Deactivated</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>{u.email}</div>
                        {u.extraInfo && (
                          <div style={{ fontSize: '11px', color: 'var(--teal-deep)', marginTop: '4px', background: 'var(--teal-soft)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            {u.extraInfo}
                          </div>
                        )}
                      </td>
                      
                      {/* Account ID */}
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                        {u.uid.substring(0, 8)}...
                      </td>

                      {/* System Role */}
                      <td style={{ padding: '14px 18px' }}>
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Onboarding Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {u.onboardingComplete ? (
                          <span className="badge success flex items-center gap-1" style={{ background: 'var(--success-soft)', color: 'oklch(38% 0.11 158)' }}>
                            <CheckCircle className="w-3 h-3" /> Complete
                          </span>
                        ) : (
                          <span className="badge warn flex items-center gap-1" style={{ background: 'var(--warn-soft)', color: 'oklch(48% 0.13 78)' }}>
                            <AlertTriangle className="w-3 h-3" /> Incomplete
                          </span>
                        )}
                      </td>

                      {/* Role Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Switch to:</span>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as any, u.email)}
                            className="select"
                            style={{ width: 'auto', fontSize: '13px', padding: '5px 10px', minWidth: '120px' }}
                          >
                            <option value="patient">Patient</option>
                            <option value="solo_provider">Clinician</option>
                            <option value="provider_org">Clinic / Org</option>
                            <option value="admin">🔒 Admin</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleToggleDeactivate(u.uid, u.disabled || false, u.email)}
                            className={`btn btn-sm ${u.disabled ? 'btn-soft' : 'btn-ghost'}`}
                            style={{ 
                              fontSize: '12.5px', 
                              padding: '5px 12px',
                              borderColor: u.disabled ? 'oklch(70% 0.13 78 / 0.32)' : 'var(--border)', 
                              color: u.disabled ? 'oklch(48% 0.13 78)' : 'var(--fg-soft)' 
                            }}
                          >
                            {u.disabled ? 'Reactivate' : 'Deactivate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(u.uid, u.email, u.role)}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '12.5px', padding: '5px 12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }} className="italic">
                        No accounts found matching search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scope disclaimer */}
        <div className="notice flex gap-3.5 items-start">
          <ShieldAlert className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
          <div>
            <strong style={{ color: 'var(--fg)' }}>Administrative Security & Privacy Policy.</strong> Admins can manage account scopes and escalate privileges. Granting Admin access gives complete system permissions over user verification and audit lists. Ensure all changes comply with organizational security directives.
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function AdminAccountsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminAccountsContent />
    </ProtectedRoute>
  );
}
