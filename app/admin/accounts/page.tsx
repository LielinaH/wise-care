'use client';
import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { SoloProviderProfile, ProviderOrgProfile, PatientProfile } from '@/lib/firebase/types';
import { 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Heart, 
  Users, 
  Building, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  BadgeAlert,
  ClipboardList,
  Clock,
  Compass
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'users' | 'orgs' | 'clinicians' | 'patients'>('users');
  const [users, setUsers] = useState<AccountRecord[]>([]);
  const [soloProviders, setSoloProviders] = useState<SoloProviderProfile[]>([]);
  const [providerOrgs, setProviderOrgs] = useState<ProviderOrgProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  
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
        const allPatients = await firestoreHelpers.getAllPatients();
        
        setSoloProviders(solo);
        setProviderOrgs(org);
        setPatients(allPatients);

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
              extraInfo = `Clinic: ${orgProf.organizationProfile?.organizationName || orgProf.organizationName || 'Unnamed'} (${(orgProf.organizationProfile?.organizationType || orgProf.organizationType || '').replace('_', ' ')})`;
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

        // Seed mock solo
        let storedSolo = storage.getStorageItem<SoloProviderProfile[]>('wisecare.demoSoloProviders', []);
        if (storedSolo.length === 0) {
          storedSolo = [
            {
              userId: 'u2',
              displayName: 'Dr. Jane Smith, Psy.D.',
              licenseType: 'Psy.D.',
              licenseState: 'California',
              licenseNumberPlaceholder: '90123',
              specialties: ['Anxiety', 'Sleep', 'Burnout'],
              modalities: ['Telehealth', 'In-person'],
              coverageOptions: ['Aetna', 'BCBS', 'Self-pay'],
              availability: 'Accepting new clients',
              verificationStatus: 'verified',
              profile: {
                displayName: 'Dr. Jane Smith, Psy.D.',
                providerTitle: 'Licensed Psychologist',
                contactEmail: 'doc@doc.com',
                contactPhone: '555-0123',
                bio: 'Clinical psychology provider for anxiety & burnout.',
                profilePhoto: null
              },
              licensure: {
                licenseType: 'Psy.D.',
                licenseNumberPlaceholder: '90123',
                licenseState: 'California',
                licenseExpirationDate: '2028-12-31',
                licenseDocument: null,
                npiPlaceholder: '1827461940',
                telehealthStates: ['California']
              },
              careDetails: {
                specialties: ['Anxiety', 'Sleep', 'Burnout'],
                modalities: ['Telehealth', 'In-person'],
                acceptedCoverageOptions: ['Aetna', 'BCBS', 'Self-pay'],
                selfPayRate: '$160',
                slidingScaleAvailable: true,
                availability: 'Accepting new clients',
                languages: ['English']
              },
              createdAt: null,
              updatedAt: null
            }
          ];
          storage.setStorageItem('wisecare.demoSoloProviders', storedSolo);
        }
        setSoloProviders(storedSolo);

        // Seed mock orgs
        let storedOrgs = storage.getStorageItem<ProviderOrgProfile[]>('wisecare.demoProviderOrgs', []);
        if (storedOrgs.length === 0) {
          storedOrgs = [
            {
              orgId: 'u3',
              ownerUserId: 'u3',
              organizationName: 'Quietford Counseling Collective',
              organizationType: 'group_practice',
              verificationStatus: 'verified',
              services: ['Psychology Session', 'Couples Therapy'],
              specialties: ['Anxiety', 'Sleep'],
              modalities: ['Telehealth', 'In-person'],
              coverageOptions: ['BCBS', 'Self-pay'],
              locations: ['California'],
              availability: 'Accepting new clients',
              organizationProfile: {
                organizationName: 'Quietford Practice Group',
                organizationType: 'group_practice',
                organizationBio: 'A holistic group practice specializing in families and couples.',
                primaryContactName: 'Quietford Manager',
                primaryContactEmail: 'clinic@clinic.com',
                primaryContactPhone: '555-0999',
                logo: null
              },
              credentialInfo: {
                businessLicensePlaceholder: 'BUS-908123',
                licenseState: 'California',
                credentialDocument: null
              },
              serviceDetails: {
                servicesOffered: ['Psychology Session', 'Couples Therapy'],
                specialties: ['Anxiety', 'Sleep'],
                modalities: ['Telehealth', 'In-person'],
                locations: ['California'],
                acceptedCoverageOptions: ['BCBS', 'Self-pay'],
                slidingScaleAvailable: true,
                availability: 'Accepting new clients',
                clinicianCount: 6
              },
              createdAt: null,
              updatedAt: null
            }
          ];
          storage.setStorageItem('wisecare.demoProviderOrgs', storedOrgs);
        }
        setProviderOrgs(storedOrgs);

        // Seed mock patients
        let storedPatients = storage.getStorageItem<PatientProfile[]>('wisecare.demoPatients', []);
        if (storedPatients.length === 0) {
          storedPatients = [
            {
              userId: 'u1',
              displayName: 'User Patient',
              intakeStatus: 'completed',
              activeCareRouteId: 'route_1',
              activeCarePacketId: 'packet_1',
              activeReferralId: null,
              intakeAnswers: {
                concerns: ['Anxiety', 'Sleep'],
                severity: 'mild',
                safety: 'none',
                prefModality: 'Telehealth',
                prefBilling: 'Self-pay',
              },
              savedProviderIds: ['u2'],
              createdAt: null,
              updatedAt: null
            },
            {
              userId: 'u5',
              displayName: 'Lielina Haile',
              intakeStatus: 'completed',
              activeCareRouteId: 'route_5',
              activeCarePacketId: 'packet_5',
              activeReferralId: null,
              intakeAnswers: {
                concerns: ['Stress', 'Burnout'],
                severity: 'moderate',
                safety: 'none',
                prefModality: 'In-person',
                prefBilling: 'BCBS',
              },
              savedProviderIds: [],
              createdAt: null,
              updatedAt: null
            }
          ];
          storage.setStorageItem('wisecare.demoPatients', storedPatients);
        }
        setPatients(storedPatients);
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

        const updatedSolo = soloProviders.filter(s => s.userId !== uid);
        storage.setStorageItem('wisecare.demoSoloProviders', updatedSolo);

        const updatedOrgs = providerOrgs.filter(o => o.orgId !== uid);
        storage.setStorageItem('wisecare.demoProviderOrgs', updatedOrgs);

        const updatedPatients = patients.filter(p => p.userId !== uid);
        storage.setStorageItem('wisecare.demoPatients', updatedPatients);
      }
      setSuccessMessage(`Account ${email} successfully deleted`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadAccounts();
    } catch (err: any) {
      alert(`Error deleting account: ${err.message || 'Operation failed'}`);
    }
  };

  const handleVerificationStatusChange = async (
    providerId: string,
    providerType: 'solo_provider' | 'provider_org',
    newStatus: 'draft' | 'pending' | 'verified' | 'rejected' | 'request_info',
    email: string
  ) => {
    const ok = window.confirm(`Are you sure you want to change the verification status of ${email} to '${newStatus}'?`);
    if (!ok) return;

    try {
      if (isFirebaseMode) {
        await firestoreHelpers.updateProviderVerificationStatus(
          providerId,
          providerType,
          newStatus,
          'Updated status via admin directory console override.',
          {},
          {}
        );
      } else {
        if (providerType === 'solo_provider') {
          const stored = soloProviders.map(p => {
            if (p.userId === providerId) {
              return {
                ...p,
                verificationStatus: newStatus,
                verification: {
                  ...p.verification,
                  verificationStatus: newStatus
                } as any
              };
            }
            return p;
          });
          setSoloProviders(stored);
          storage.setStorageItem('wisecare.demoSoloProviders', stored);
        } else {
          const stored = providerOrgs.map(o => {
            if (o.orgId === providerId) {
              return {
                ...o,
                verificationStatus: newStatus,
                verification: {
                  ...o.verification,
                  verificationStatus: newStatus
                } as any
              };
            }
            return o;
          });
          setProviderOrgs(stored);
          storage.setStorageItem('wisecare.demoProviderOrgs', stored);
        }
      }
      setSuccessMessage(`Verification status for ${email} successfully updated to '${newStatus}'`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadAccounts();
    } catch (err: any) {
      alert(`Error updating verification status: ${err.message || 'Operation failed'}`);
    }
  };

  const getRoleBadge = (role: AccountRecord['role']) => {
    switch (role) {
      case 'admin':
        return <span className="badge danger flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Admin</span>;
      case 'solo_provider':
        return <span className="badge teal flex items-center gap-1"><User className="w-3.5 h-3.5" /> Clinician</span>;
      case 'provider_org':
        return <span className="badge blue flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Clinic / Org</span>;
      case 'patient':
        return <span className="badge success flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> Patient</span>;
      default:
        return <span className="badge flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> User</span>;
    }
  };

  const getVerificationStatusBadge = (status?: string) => {
    const cleanStatus = status || 'draft';
    switch (cleanStatus) {
      case 'verified':
        return <span className="badge teal py-0.5 px-2 text-[10px] uppercase font-semibold">Verified</span>;
      case 'pending':
        return <span className="badge warn py-0.5 px-2 text-[10px] uppercase font-semibold animate-pulse">Pending Review</span>;
      case 'request_info':
        return <span className="badge warn py-0.5 px-2 text-[10px] uppercase font-semibold text-amber-800 bg-amber-100">Info Requested</span>;
      case 'rejected':
        return <span className="badge danger py-0.5 px-2 text-[10px] uppercase font-semibold">Rejected</span>;
      default:
        return <span className="badge py-0.5 px-2 text-[10px] uppercase font-semibold bg-slate-100 text-slate-600">Draft</span>;
    }
  };

  // Filtered Users Tab
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.uid.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Organizations Tab
  const filteredOrgs = providerOrgs.filter(o => {
    const orgName = o.organizationProfile?.organizationName || o.organizationName || '';
    const contactEmail = o.organizationProfile?.primaryContactEmail || '';
    const type = o.organizationProfile?.organizationType || o.organizationType || '';
    const locations = o.serviceDetails?.locations?.join(' ') || o.locations?.join(' ') || '';
    const specialties = o.serviceDetails?.specialties?.join(' ') || o.specialties?.join(' ') || '';
    const services = o.serviceDetails?.servicesOffered?.join(' ') || o.services?.join(' ') || '';

    const query = search.toLowerCase();
    return (
      orgName.toLowerCase().includes(query) ||
      contactEmail.toLowerCase().includes(query) ||
      type.toLowerCase().includes(query) ||
      locations.toLowerCase().includes(query) ||
      specialties.toLowerCase().includes(query) ||
      services.toLowerCase().includes(query) ||
      o.orgId.toLowerCase().includes(query)
    );
  });

  // Filtered Clinicians Tab
  const filteredClinicians = soloProviders.filter(s => {
    const name = s.profile?.displayName || s.displayName || '';
    const title = s.profile?.providerTitle || s.licenseType || '';
    const state = s.licensure?.licenseState || s.licenseState || '';
    const number = s.licensure?.licenseNumberPlaceholder || s.licenseNumberPlaceholder || '';
    const npi = s.licensure?.npiPlaceholder || '';
    const email = s.profile?.contactEmail || '';
    const specialties = s.careDetails?.specialties?.join(' ') || s.specialties?.join(' ') || '';

    const query = search.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      title.toLowerCase().includes(query) ||
      state.toLowerCase().includes(query) ||
      number.toLowerCase().includes(query) ||
      npi.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      specialties.toLowerCase().includes(query) ||
      s.userId.toLowerCase().includes(query)
    );
  });

  // Filtered Patients Tab
  const filteredPatients = patients.filter(p => {
    const name = p.displayName || '';
    const status = p.intakeStatus || '';
    const concerns = p.intakeAnswers?.concerns?.join(' ') || '';
    const billing = p.intakeAnswers?.prefBilling || '';
    const email = users.find(u => u.uid === p.userId)?.email || '';

    const query = search.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query) ||
      concerns.toLowerCase().includes(query) ||
      billing.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      p.userId.toLowerCase().includes(query)
    );
  });

  return (
    <AppShell title="Operations Database" crumbs={['Operations', 'Directory Hub']}>
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Title block */}
        <div>
          <span className="kicker">Admin Operations Console</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Membership &amp; Directory Audits</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Browse user logins, clinic profiles, NPI registrations, and directory verification scopes side-by-side.
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
                placeholder={
                  activeTab === 'users' ? 'Search emails, display names, UIDs...' :
                  activeTab === 'orgs' ? 'Search clinic names, contact emails, services, specialties...' :
                  activeTab === 'clinicians' ? 'Search clinician names, titles, licenses, NPI numbers...' :
                  'Search patient names, emails, concerns, preferences...'
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search className="w-4 h-4 text-wise-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {activeTab === 'users' && (
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
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-wise-border gap-6 mb-2">
          <button
            onClick={() => { setActiveTab('users'); setSearch(''); }}
            className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-1.5 ${
              activeTab === 'users' ? 'text-wise-teal' : 'text-wise-muted hover:text-wise-fg'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Logins ({filteredUsers.length})</span>
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wise-teal" />}
          </button>
          
          <button
            onClick={() => { setActiveTab('orgs'); setSearch(''); }}
            className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-1.5 ${
              activeTab === 'orgs' ? 'text-wise-teal' : 'text-wise-muted hover:text-wise-fg'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Clinic Organizations ({filteredOrgs.length})</span>
            {activeTab === 'orgs' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wise-teal" />}
          </button>

          <button
            onClick={() => { setActiveTab('clinicians'); setSearch(''); }}
            className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-1.5 ${
              activeTab === 'clinicians' ? 'text-wise-teal' : 'text-wise-muted hover:text-wise-fg'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Solo Clinicians ({filteredClinicians.length})</span>
            {activeTab === 'clinicians' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wise-teal" />}
          </button>

          <button
            onClick={() => { setActiveTab('patients'); setSearch(''); }}
            className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-1.5 ${
              activeTab === 'patients' ? 'text-wise-teal' : 'text-wise-muted hover:text-wise-fg'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Patients ({filteredPatients.length})</span>
            {activeTab === 'patients' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-wise-teal" />}
          </button>
        </div>

        {/* Database Tables Container */}
        <div className="card elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="spin w-8 h-8 border-2 border-wise-teal border-t-transparent rounded-full" />
              <span className="text-sm text-wise-muted">Loading directory index...</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              
              {/* TAB 1: USER ACCOUNTS TABLE */}
              {activeTab === 'users' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-sunk)', borderBottom: '1px solid var(--hairline)', color: 'var(--fg-soft)', fontWeight: 600 }}>
                      <th style={{ padding: '14px 18px' }}>User Details</th>
                      <th style={{ padding: '14px 18px' }}>User UID</th>
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
                        <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                          {u.uid.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {getRoleBadge(u.role)}
                        </td>
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
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Switch:</span>
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
                              style={{ fontSize: '12.5px', padding: '5px 12px' }}
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
                          No user accounts found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: CLINIC ORGANIZATIONS TABLE */}
              {activeTab === 'orgs' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-sunk)', borderBottom: '1px solid var(--hairline)', color: 'var(--fg-soft)', fontWeight: 600 }}>
                      <th style={{ padding: '14px 18px' }}>Clinic Name &amp; Profile</th>
                      <th style={{ padding: '14px 18px' }}>Contact &amp; Owner</th>
                      <th style={{ padding: '14px 18px' }}>Scope &amp; Coverage</th>
                      <th style={{ padding: '14px 18px' }}>Locations / staff</th>
                      <th style={{ padding: '14px 18px' }}>Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wise-hairline">
                    {filteredOrgs.map((o) => {
                      const name = o.organizationProfile?.organizationName || o.organizationName || 'Unnamed Clinic';
                      const type = (o.organizationProfile?.organizationType || o.organizationType || 'group_practice').replace('_', ' ');
                      const contactName = o.organizationProfile?.primaryContactName || 'No contact specified';
                      const contactEmail = o.organizationProfile?.primaryContactEmail || '';
                      const contactPhone = o.organizationProfile?.primaryContactPhone || '';
                      const bio = o.organizationProfile?.organizationBio || '';
                      const locations = o.serviceDetails?.locations || o.locations || [];
                      const modalities = o.serviceDetails?.modalities || o.modalities || [];
                      const specialties = o.serviceDetails?.specialties || o.specialties || [];
                      const coverage = o.serviceDetails?.acceptedCoverageOptions || o.coverageOptions || [];
                      const activeStaff = o.serviceDetails?.clinicianCount || 1;
                      const status = o.verification?.verificationStatus || o.verificationStatus;

                      const userAcc = users.find(u => u.uid === o.orgId);
                      const userEmail = userAcc?.email || contactEmail || '';
                      const userDisabled = userAcc?.disabled || false;
                      const userRole = userAcc?.role || 'provider_org';

                      return (
                        <tr 
                          key={o.orgId} 
                          style={{ borderBottom: '1px solid var(--hairline)', transition: 'background var(--t-fast)' }}
                          className="hover:bg-wise-surface-2"
                        >
                          {/* Clinic Name & Profile */}
                          <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                              {type}
                            </div>
                            {bio && (
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {bio}
                              </div>
                            )}
                            {o.organizationProfile?.website && (
                              <a href={o.organizationProfile.website} target="_blank" rel="noreferrer" className="text-wise-teal hover:underline flex items-center gap-1 mt-2 text-xs">
                                <Globe className="w-3.5 h-3.5" /> Visit site
                              </a>
                            )}
                          </td>

                          {/* Contact & Owner */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            <div className="font-semibold text-wise-fg">{contactName}</div>
                            {contactEmail && (
                              <div className="flex items-center gap-1 text-wise-muted mt-1">
                                <Mail className="w-3.5 h-3.5" /> {contactEmail}
                              </div>
                            )}
                            {contactPhone && (
                              <div className="flex items-center gap-1 text-wise-muted mt-0.5">
                                <Phone className="w-3.5 h-3.5" /> {contactPhone}
                              </div>
                            )}
                            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                              Owner UID: {o.ownerUserId.substring(0, 8)}...
                            </div>
                          </td>

                          {/* Scope & Coverage */}
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', maxWidth: '250px' }}>
                            <div>
                              <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Specialties</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {specialties.map(s => <span key={s} className="badge" style={{ fontSize: '10.5px', padding: '1px 5px' }}>{s}</span>)}
                                {specialties.length === 0 && <span className="text-wise-muted italic">None specified</span>}
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Insurances</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {coverage.map(c => <span key={c} className="badge teal" style={{ fontSize: '10.5px', padding: '1px 5px' }}>{c}</span>)}
                                {coverage.length === 0 && <span className="text-wise-muted italic">None specified</span>}
                              </div>
                            </div>
                          </td>

                          {/* Locations / staff */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            <div className="flex items-center gap-1 text-wise-fg">
                              <MapPin className="w-3.5 h-3.5 text-wise-teal" />
                              <span>{locations.join(', ') || 'N/A'}</span>
                            </div>
                            <div className="text-wise-muted mt-1">
                              Modalities: <strong style={{ color: 'var(--fg-soft)' }}>{modalities.join(', ') || 'N/A'}</strong>
                            </div>
                            <div className="text-wise-muted mt-2 text-xs">
                              Clinician headcount: <span className="badge font-semibold" style={{ fontSize: '11px', padding: '2px 6px' }}>{activeStaff} FTEs</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {getVerificationStatusBadge(status)}
                                {userDisabled && (
                                  <span className="badge danger" style={{ fontSize: '9.5px', padding: '2px 6px' }}>Deactivated</span>
                                )}
                              </div>
                              {o.credentialInfo?.businessLicensePlaceholder && (
                                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }} className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-wise-teal" /> Lic: {o.credentialInfo.businessLicensePlaceholder}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {/* Verification Status Switcher */}
                              <div className="flex flex-col items-start gap-1" style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Verification Status:</span>
                                <select
                                  value={status || 'draft'}
                                  onChange={(e) => handleVerificationStatusChange(o.orgId, 'provider_org', e.target.value as any, userEmail)}
                                  className="select"
                                  style={{ width: 'auto', fontSize: '12.5px', padding: '4px 8px', minWidth: '120px' }}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="pending">Pending Review</option>
                                  <option value="request_info">Info Requested</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="verified">Verified</option>
                                </select>
                              </div>

                              {/* Role Switcher */}
                              {userAcc && (
                                <div className="flex flex-col items-start gap-1" style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Login Role:</span>
                                  <select
                                    value={userRole}
                                    onChange={(e) => handleRoleChange(o.orgId, e.target.value as any, userEmail)}
                                    className="select"
                                    style={{ width: 'auto', fontSize: '12.5px', padding: '4px 8px', minWidth: '110px' }}
                                  >
                                    <option value="patient">Patient</option>
                                    <option value="solo_provider">Clinician</option>
                                    <option value="provider_org">Clinic / Org</option>
                                    <option value="admin">🔒 Admin</option>
                                  </select>
                                </div>
                              )}

                              {userAcc && (
                                <div className="flex items-center gap-1.5" style={{ alignSelf: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDeactivate(o.orgId, userDisabled, userEmail)}
                                    className={`btn btn-xs ${userDisabled ? 'btn-soft' : 'btn-ghost'}`}
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    {userDisabled ? 'Reactivate' : 'Deactivate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(o.orgId, userEmail, userRole)}
                                    className="btn btn-danger btn-xs"
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrgs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }} className="italic">
                          No clinic organizations found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 3: SOLO CLINICIANS TABLE */}
              {activeTab === 'clinicians' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-sunk)', borderBottom: '1px solid var(--hairline)', color: 'var(--fg-soft)', fontWeight: 600 }}>
                      <th style={{ padding: '14px 18px' }}>Clinician &amp; Title</th>
                      <th style={{ padding: '14px 18px' }}>Licensure Details</th>
                      <th style={{ padding: '14px 18px' }}>Specialties &amp; Modalities</th>
                      <th style={{ padding: '14px 18px' }}>Contact details</th>
                      <th style={{ padding: '14px 18px' }}>Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wise-hairline">
                    {filteredClinicians.map((s) => {
                      const name = s.profile?.displayName || s.displayName || 'Unnamed Clinician';
                      const title = s.profile?.providerTitle || s.licenseType || 'Licensed Clinician';
                      const licenseType = s.licensure?.licenseType || s.licenseType || 'LMFT';
                      const licenseState = s.licensure?.licenseState || s.licenseState || 'California';
                      const licenseNumber = s.licensure?.licenseNumberPlaceholder || s.licenseNumberPlaceholder || 'N/A';
                      const licenseExp = s.licensure?.licenseExpirationDate || 'N/A';
                      const npi = s.licensure?.npiPlaceholder || 'N/A';
                      
                      const email = s.profile?.contactEmail || '';
                      const phone = s.profile?.contactPhone || '';
                      const bio = s.profile?.bio || '';

                      const specialties = s.careDetails?.specialties || s.specialties || [];
                      const modalities = s.careDetails?.modalities || s.modalities || [];
                      const coverage = s.careDetails?.acceptedCoverageOptions || s.coverageOptions || [];
                      const rate = s.careDetails?.selfPayRate || '';
                      const status = s.verification?.verificationStatus || s.verificationStatus;

                      const userAcc = users.find(u => u.uid === s.userId);
                      const userEmail = userAcc?.email || email || '';
                      const userDisabled = userAcc?.disabled || false;
                      const userRole = userAcc?.role || 'solo_provider';

                      return (
                        <tr 
                          key={s.userId} 
                          style={{ borderBottom: '1px solid var(--hairline)', transition: 'background var(--t-fast)' }}
                          className="hover:bg-wise-surface-2"
                        >
                          {/* Clinician & Title */}
                          <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                              {title}
                            </div>
                            {bio && (
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {bio}
                              </div>
                            )}
                          </td>

                          {/* Licensure Details */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            <div style={{ fontWeight: 600 }} className="text-wise-fg">{licenseType} ({licenseState})</div>
                            <div className="text-wise-muted mt-1 font-mono text-xs">Lic #: {licenseNumber}</div>
                            <div className="text-wise-muted mt-0.5 font-mono text-xs">NPI: {npi}</div>
                            {licenseExp && (
                              <div className="text-wise-muted mt-1 text-[11px]">Exp: {licenseExp}</div>
                            )}
                          </td>

                          {/* Specialties & Modalities */}
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', maxWidth: '280px' }}>
                            <div>
                              <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Specialties</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {specialties.map(spec => <span key={spec} className="badge" style={{ fontSize: '10.5px', padding: '1px 5px' }}>{spec}</span>)}
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Modalities / Rates</span>
                              <div className="text-wise-fg mt-1">
                                {modalities.join(', ') || 'N/A'} {rate && `· ${rate}`}
                              </div>
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            {email && (
                              <div className="flex items-center gap-1 text-wise-fg truncate" style={{ maxWidth: '180px' }}>
                                <Mail className="w-3.5 h-3.5 text-wise-teal shrink-0" /> <span className="truncate">{email}</span>
                              </div>
                            )}
                            {phone && (
                              <div className="flex items-center gap-1 text-wise-muted mt-1">
                                <Phone className="w-3.5 h-3.5 text-wise-teal shrink-0" /> {phone}
                              </div>
                            )}
                            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                              User UID: {s.userId.substring(0, 8)}...
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {getVerificationStatusBadge(status)}
                                {userDisabled && (
                                  <span className="badge danger" style={{ fontSize: '9.5px', padding: '2px 6px' }}>Deactivated</span>
                                )}
                              </div>
                              {s.availability && (
                                <div style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.availability}>
                                  {s.availability}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {/* Verification Status Switcher */}
                              <div className="flex flex-col items-start gap-1" style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Verification Status:</span>
                                <select
                                  value={status || 'draft'}
                                  onChange={(e) => handleVerificationStatusChange(s.userId, 'solo_provider', e.target.value as any, userEmail)}
                                  className="select"
                                  style={{ width: 'auto', fontSize: '12.5px', padding: '4px 8px', minWidth: '120px' }}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="pending">Pending Review</option>
                                  <option value="request_info">Info Requested</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="verified">Verified</option>
                                </select>
                              </div>

                              {/* Role Switcher */}
                              {userAcc && (
                                <div className="flex flex-col items-start gap-1" style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Login Role:</span>
                                  <select
                                    value={userRole}
                                    onChange={(e) => handleRoleChange(s.userId, e.target.value as any, userEmail)}
                                    className="select"
                                    style={{ width: 'auto', fontSize: '12.5px', padding: '4px 8px', minWidth: '110px' }}
                                  >
                                    <option value="patient">Patient</option>
                                    <option value="solo_provider">Clinician</option>
                                    <option value="provider_org">Clinic / Org</option>
                                    <option value="admin">🔒 Admin</option>
                                  </select>
                                </div>
                              )}

                              {userAcc && (
                                <div className="flex items-center gap-1.5" style={{ alignSelf: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDeactivate(s.userId, userDisabled, userEmail)}
                                    className={`btn btn-xs ${userDisabled ? 'btn-soft' : 'btn-ghost'}`}
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    {userDisabled ? 'Reactivate' : 'Deactivate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(s.userId, userEmail, userRole)}
                                    className="btn btn-danger btn-xs"
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredClinicians.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }} className="italic">
                          No solo clinicians found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 4: PATIENTS TABLE */}
              {activeTab === 'patients' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-sunk)', borderBottom: '1px solid var(--hairline)', color: 'var(--fg-soft)', fontWeight: 600 }}>
                      <th style={{ padding: '14px 18px' }}>Patient Name</th>
                      <th style={{ padding: '14px 18px' }}>Contact &amp; Logins</th>
                      <th style={{ padding: '14px 18px' }}>Intake Status</th>
                      <th style={{ padding: '14px 18px' }}>Concerns &amp; Preferences</th>
                      <th style={{ padding: '14px 18px' }}>Active Documents</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wise-hairline">
                    {filteredPatients.map((p) => {
                      const name = p.displayName || 'Unnamed Patient';
                      const userAcc = users.find(u => u.uid === p.userId);
                      const email = userAcc?.email || '';
                      const userDisabled = userAcc?.disabled || false;
                      const userRole = userAcc?.role || 'patient';
                      
                      const concerns: string[] = p.intakeAnswers?.concerns || [];
                      const prefModality = p.intakeAnswers?.prefModality || '';
                      const prefBilling = p.intakeAnswers?.prefBilling || '';
                      const intakeComplete = p.intakeStatus === 'completed';

                      return (
                        <tr 
                          key={p.userId} 
                          style={{ borderBottom: '1px solid var(--hairline)', transition: 'background var(--t-fast)' }}
                          className="hover:bg-wise-surface-2"
                        >
                          {/* Patient Name */}
                          <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{name}</div>
                            {userDisabled && (
                              <span className="badge danger mt-1" style={{ fontSize: '9.5px', padding: '2px 6px', display: 'inline-block' }}>Deactivated</span>
                            )}
                          </td>

                          {/* Contact & Logins */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            {email && (
                              <div className="flex items-center gap-1 text-wise-fg truncate" style={{ maxWidth: '180px' }}>
                                <Mail className="w-3.5 h-3.5 text-wise-teal shrink-0" /> <span className="truncate">{email}</span>
                              </div>
                            )}
                            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                              User UID: {p.userId.substring(0, 8)}...
                            </div>
                          </td>

                          {/* Intake Status */}
                          <td style={{ padding: '14px 18px' }}>
                            {intakeComplete ? (
                              <span className="badge success flex items-center gap-1" style={{ background: 'var(--success-soft)', color: 'oklch(38% 0.11 158)' }}>
                                <CheckCircle className="w-3.5 h-3.5" /> Complete
                              </span>
                            ) : p.intakeStatus === 'started' ? (
                              <span className="badge warn flex items-center gap-1" style={{ background: 'var(--warn-soft)', color: 'oklch(48% 0.13 78)' }}>
                                <Clock className="w-3.5 h-3.5 animate-pulse" /> In Progress
                              </span>
                            ) : (
                              <span className="badge flex items-center gap-1" style={{ background: 'var(--slate-100)', color: 'var(--muted)' }}>
                                <AlertTriangle className="w-3.5 h-3.5" /> Not Started
                              </span>
                            )}
                          </td>

                          {/* Concerns & Preferences */}
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', maxWidth: '280px' }}>
                            {concerns.length > 0 ? (
                              <div>
                                <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Concerns</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {concerns.map(c => <span key={c} className="badge" style={{ fontSize: '10.5px', padding: '1px 5px' }}>{c}</span>)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-wise-muted italic">No intake concerns registered</div>
                            )}

                            {(prefModality || prefBilling) && (
                              <div className="mt-2.5">
                                <span className="text-wise-muted block text-[10px] uppercase tracking-wider font-mono">Preferences</span>
                                <span style={{ color: 'var(--fg-soft)' }}>
                                  {prefModality && `${prefModality}`}
                                  {prefModality && prefBilling && ' · '}
                                  {prefBilling && `${prefBilling}`}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Active Documents */}
                          <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                            {p.activeCareRouteId && (
                              <div className="flex items-center gap-1 text-wise-fg mt-0.5">
                                <Compass className="w-3.5 h-3.5 text-wise-teal" /> Route: {p.activeCareRouteId.substring(0, 8)}...
                              </div>
                            )}
                            {p.activeCarePacketId && (
                              <div className="flex items-center gap-1 text-wise-muted mt-1">
                                <FileText className="w-3.5 h-3.5 text-wise-teal" /> Packet: {p.activeCarePacketId.substring(0, 8)}...
                              </div>
                            )}
                            {!p.activeCareRouteId && !p.activeCarePacketId && (
                              <span className="text-wise-muted italic">No active care documents</span>
                            )}
                          </td>

                          {/* Admin Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {/* Role Switcher */}
                              {userAcc && (
                                <div className="flex flex-col items-start gap-1" style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Login Role:</span>
                                  <select
                                    value={userRole}
                                    onChange={(e) => handleRoleChange(p.userId, e.target.value as any, email)}
                                    className="select"
                                    style={{ width: 'auto', fontSize: '12.5px', padding: '4px 8px', minWidth: '110px' }}
                                  >
                                    <option value="patient">Patient</option>
                                    <option value="solo_provider">Clinician</option>
                                    <option value="provider_org">Clinic / Org</option>
                                    <option value="admin">🔒 Admin</option>
                                  </select>
                                </div>
                              )}

                              {userAcc && (
                                <div className="flex items-center gap-1.5" style={{ alignSelf: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDeactivate(p.userId, userDisabled, email)}
                                    className={`btn btn-xs ${userDisabled ? 'btn-soft' : 'btn-ghost'}`}
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    {userDisabled ? 'Reactivate' : 'Deactivate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(p.userId, email, userRole)}
                                    className="btn btn-danger btn-xs"
                                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }} className="italic">
                          No patients found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

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
