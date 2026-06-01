'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { uploadProviderFile } from '@/lib/firebase/storage';
import { FileMetadata } from '@/lib/firebase/types';
import { Check, Info, Lock, ArrowRight, ArrowLeft, Loader2, Upload, FileText, Building } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ALL_SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];
const ALL_INSURANCES = ['Aetna', 'BCBS', 'Cigna', 'United', 'Public Coverage', 'Sliding scale', 'Self-pay'];

function OrgProviderRegisterContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();

  // Basic Profile
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org'>('group_practice');
  const [organizationBio, setOrganizationBio] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [logoMeta, setLogoMeta] = useState<FileMetadata | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Credentials
  const [businessLicense, setBusinessLicense] = useState('');
  const [licenseState, setLicenseState] = useState('California');
  const [accreditation, setAccreditation] = useState('');
  const [docMeta, setDocMeta] = useState<FileMetadata | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  // Care details
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Both');
  const [locationsText, setLocationsText] = useState('California');
  const [slidingScaleAvailable, setSlidingScaleAvailable] = useState(false);
  const [clinicianCount, setClinicianCount] = useState(5);
  const [hours, setHours] = useState('Accepting new clients');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // References
  const [ref1Name, setRef1Name] = useState('');
  const [ref1Relationship, setRef1Relationship] = useState('');
  const [ref1Email, setRef1Email] = useState('');
  const [ref1Status, setRef1Status] = useState<'not_sent' | 'requested' | 'received'>('requested');

  const [ref2Name, setRef2Name] = useState('');
  const [ref2Relationship, setRef2Relationship] = useState('');
  const [ref2Email, setRef2Email] = useState('');
  const [ref2Status, setRef2Status] = useState<'not_sent' | 'requested' | 'received'>('requested');

  // Verification state
  const [verificationStatus, setVerificationStatus] = useState<'draft' | 'pending' | 'verified' | 'rejected' | 'request_info'>('draft');
  const [adminNotes, setAdminNotes] = useState('');
  const [itemStatuses, setItemStatuses] = useState<Record<string, any>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;

      if (isFirebaseMode) {
        try {
          const profile = await firestoreHelpers.getProviderOrgProfile(currentUser.uid);
          if (profile) {
            // Profile details
            setOrganizationName(profile.organizationProfile?.organizationName || profile.organizationName || '');
            setOrganizationType(profile.organizationProfile?.organizationType || profile.organizationType || 'group_practice');
            setOrganizationBio(profile.organizationProfile?.organizationBio || '');
            setPrimaryContactName(profile.organizationProfile?.primaryContactName || '');
            setPrimaryContactEmail(profile.organizationProfile?.primaryContactEmail || currentUser.email || '');
            setPrimaryContactPhone(profile.organizationProfile?.primaryContactPhone || '');
            setWebsite(profile.organizationProfile?.website || '');
            setLogoMeta(profile.organizationProfile?.logo || null);

            // Credentials
            setBusinessLicense(profile.credentialInfo?.businessLicensePlaceholder || '');
            setLicenseState(profile.credentialInfo?.licenseState || 'California');
            setAccreditation(profile.credentialInfo?.accreditationPlaceholder || '');
            setDocMeta(profile.credentialInfo?.credentialDocument || null);

            // Service details
            setSelectedSpecs(profile.serviceDetails?.specialties || profile.specialties || []);
            setSelectedInsurances(profile.serviceDetails?.acceptedCoverageOptions || profile.coverageOptions || []);
            setLocationsText(profile.serviceDetails?.locations?.join(', ') || 'California');
            setSlidingScaleAvailable(profile.serviceDetails?.slidingScaleAvailable || false);
            setClinicianCount(profile.serviceDetails?.clinicianCount || 5);
            setHours(profile.serviceDetails?.availability || profile.availability || 'Accepting new clients');

            if (profile.serviceDetails?.modalities && profile.serviceDetails.modalities.length > 0) {
              const mods = profile.serviceDetails.modalities;
              if (mods.includes('Telehealth') && mods.includes('In-person')) {
                setModality('Both');
              } else if (mods.includes('Telehealth')) {
                setModality('Telehealth');
              } else {
                setModality('In-person');
              }
            } else if (profile.modalities && profile.modalities.length > 0) {
              if (profile.modalities.includes('Telehealth') && profile.modalities.includes('In-person')) {
                setModality('Both');
              } else if (profile.modalities.includes('Telehealth')) {
                setModality('Telehealth');
              } else {
                setModality('In-person');
              }
            }

            // References
            setRef1Name(profile.references?.reference1Name || '');
            setRef1Relationship(profile.references?.reference1Relationship || '');
            setRef1Email(profile.references?.reference1Email || '');
            setRef1Status(profile.references?.reference1Status || 'requested');

            setRef2Name(profile.references?.reference2Name || '');
            setRef2Relationship(profile.references?.reference2Relationship || '');
            setRef2Email(profile.references?.reference2Email || '');
            setRef2Status(profile.references?.reference2Status || 'requested');

            // Verification
            setVerificationStatus(profile.verification?.verificationStatus || profile.verificationStatus || 'draft');
            setAdminNotes(profile.verification?.adminNotes || '');
            setItemStatuses(profile.verification?.itemStatuses || {});
            setItemNotes(profile.verification?.itemNotes || {});
          } else {
            setPrimaryContactEmail(currentUser.email || '');
          }
        } catch (e) {
          console.error("Error loading provider organization profile:", e);
        }
      } else {
        const o = storage.getStorageItem<any>('wisecare.providers.org', null);
        if (o) {
          setOrganizationName(o.organizationProfile?.organizationName || o.organizationName || '');
          setOrganizationType(o.organizationProfile?.organizationType || o.organizationType || 'group_practice');
          setOrganizationBio(o.organizationProfile?.organizationBio || '');
          setPrimaryContactEmail(o.organizationProfile?.primaryContactEmail || currentUser.email || '');
          setBusinessLicense(o.credentialInfo?.businessLicensePlaceholder || '');
          setLicenseState(o.credentialInfo?.licenseState || 'California');
          setSelectedSpecs(o.serviceDetails?.specialties || o.specialties || []);
          setSelectedInsurances(o.serviceDetails?.acceptedCoverageOptions || o.coverageOptions || []);
          setHours(o.serviceDetails?.availability || o.availability || 'Accepting new clients');
          setVerificationStatus(o.verification?.verificationStatus || o.verificationStatus || 'draft');
        } else {
          setOrganizationName('Quietford Counseling Collective');
          setPrimaryContactEmail(currentUser.email || 'clinic@wisecare.test');
          setSelectedSpecs(['Anxiety', 'Relationships']);
          setSelectedInsurances(['BCBS', 'Self-pay']);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [currentUser, isFirebaseMode]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLogoUploading(true);
    try {
      const meta = await uploadProviderFile(currentUser.uid, 'logo', file);
      setLogoMeta(meta);
      showToast('Logo uploaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setDocUploading(true);
    try {
      const meta = await uploadProviderFile(currentUser.uid, 'credential', file);
      setDocMeta(meta);
      showToast('Accreditation/License document uploaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const profileData = {
      orgId: currentUser.uid,
      ownerUserId: currentUser.uid,
      organizationProfile: {
        organizationName: organizationName.trim(),
        organizationType,
        organizationBio: organizationBio.trim(),
        logo: logoMeta,
        primaryContactName: primaryContactName.trim(),
        primaryContactEmail: primaryContactEmail.toLowerCase().trim(),
        primaryContactPhone: primaryContactPhone.trim(),
        website: website.trim(),
      },
      credentialInfo: {
        businessLicensePlaceholder: businessLicense.trim(),
        licenseState,
        accreditationPlaceholder: accreditation.trim(),
        credentialDocument: docMeta,
      },
      serviceDetails: {
        servicesOffered: selectedSpecs.length > 0 ? selectedSpecs.map(s => `${s} Group/Therapy`) : ['General Counseling'],
        specialties: selectedSpecs,
        modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
        locations: locationsText.split(',').map(s => s.trim()).filter(Boolean),
        acceptedCoverageOptions: selectedInsurances,
        slidingScaleAvailable,
        availability: hours,
        clinicianCount,
      },
      references: {
        reference1Name: ref1Name.trim(),
        reference1Relationship: ref1Relationship.trim(),
        reference1Email: ref1Email.toLowerCase().trim(),
        reference1Status: ref1Status,
        reference2Name: ref2Name.trim(),
        reference2Relationship: ref2Relationship.trim(),
        reference2Email: ref2Email.toLowerCase().trim(),
        reference2Status: ref2Status,
      },
      verification: {
        verificationStatus: verificationStatus === 'draft' ? 'pending' : verificationStatus,
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        adminNotes: adminNotes,
        itemStatuses: itemStatuses,
        itemNotes: itemNotes,
      },
      // Legacy compatibility fields
      organizationName: organizationName.trim(),
      organizationType,
      verificationStatus: verificationStatus === 'draft' ? 'pending' : verificationStatus,
      specialties: selectedSpecs,
      modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
      coverageOptions: selectedInsurances,
      locations: locationsText.split(',').map(s => s.trim()).filter(Boolean),
      availability: hours,
    };

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setProviderOrgProfile(currentUser.uid, profileData);
      } catch (e) {
        console.error("Error saving org profile:", e);
        showToast("Database write failed. Review console logs.");
        return;
      }
    } else {
      storage.setStorageItem('wisecare.providers.org', profileData);
    }

    setToastMsg('Clinic profile details submitted successfully');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/org/dashboard');
    }, 1500);
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const toggleInsurance = (ins: string) => {
    setSelectedInsurances(prev => 
      prev.includes(ins) ? prev.filter(i => i !== ins) : [...prev, ins]
    );
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return (
      <AppShell title="Clinic Settings" crumbs={['Practice', 'Clinic Settings']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading clinic details...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Clinic Profile" 
      crumbs={['Practice', 'Clinic Settings']}
      actions={
        <Link href="/provider/org/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</Link>
      }
    >
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="reg-wrap enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Clinic profile settings</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Edit clinic parameters</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Enter your organization, credentials, and references evidence below. Only verified listings can receive patient matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verification Timeline */}
          <div className="form-section">
            <div className="inner">
              <h3>Verification status</h3>
              <p className="sub">Platform audits check licensing coordinates prior to publishing directory matches.</p>
              <div className="verify-stages flex flex-col md:flex-row gap-2.5">
                <div className={`vs ${verificationStatus !== 'draft' ? 'done' : 'active'}`}>
                  <div className="step-dot">
                    {verificationStatus !== 'draft' ? <Check className="w-3 h-3 text-emerald-700" /> : '1'}
                  </div>
                  <div>
                    <div className="t">Submit profile</div>
                    <div className="d">{verificationStatus !== 'draft' ? 'Completed' : 'Action needed'}</div>
                  </div>
                </div>
                <div className={`vs ${verificationStatus === 'verified' ? 'done' : (verificationStatus === 'pending' ? 'active' : (verificationStatus === 'request_info' ? 'active warn' : ''))}`}>
                  <div className="step-dot">
                    {verificationStatus === 'verified' ? <Check className="w-3 h-3 text-emerald-700" /> : '2'}
                  </div>
                  <div>
                    <div className="t">Admin credential check</div>
                    <div className="d">
                      {verificationStatus === 'verified' 
                        ? 'Approved' 
                        : (verificationStatus === 'pending' 
                          ? 'Pending audit' 
                          : (verificationStatus === 'request_info' 
                            ? 'Need Information' 
                            : 'Awaiting submit'))}
                    </div>
                  </div>
                </div>
                <div className={`vs ${verificationStatus === 'verified' ? 'active' : ''}`}>
                  <div className="step-dot">{verificationStatus === 'verified' ? <Check className="w-3 h-3 text-emerald-700" /> : '3'}</div>
                  <div>
                    <div className="t">Matching live</div>
                    <div className="d">{verificationStatus === 'verified' ? 'Active in directory' : 'Pending credential approval'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Clinic Profile */}
          <div className="form-section">
            <div className="inner">
              <h3>1. Clinic &amp; Organization Details</h3>
              <p className="sub">This information is shown to users on your directory profile card.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Clinic/Organization Name</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={organizationName} 
                    onChange={e => setOrganizationName(e.target.value)}
                    required
                    placeholder="e.g. Quietford counseling Collective"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Clinic Type</label>
                  <select 
                    className="select" 
                    value={organizationType} 
                    onChange={e => setOrganizationType(e.target.value as any)}
                  >
                    <option value="group_practice">Group practice / collective</option>
                    <option value="clinic">Outpatient clinic</option>
                    <option value="hospital">Hospital system</option>
                    <option value="telehealth_group">Telehealth group</option>
                    <option value="community_clinic">Community mental health clinic</option>
                    <option value="support_org">Support group / EAP service</option>
                  </select>
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Organization Description / Bio</label>
                  <textarea 
                    className="textarea" 
                    value={organizationBio} 
                    onChange={e => setOrganizationBio(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your clinic's services, team, care philosophy, and who you help..."
                  />
                </div>
                <div className="field">
                  <label className="field-label">Primary Contact Person</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={primaryContactName} 
                    onChange={e => setPrimaryContactName(e.target.value)}
                    required
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Primary Contact Email</label>
                  <input 
                    className="input" 
                    type="email" 
                    value={primaryContactEmail} 
                    onChange={e => setPrimaryContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Primary Contact Phone</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={primaryContactPhone} 
                    onChange={e => setPrimaryContactPhone(e.target.value)}
                    required
                    placeholder="e.g. (555) 0192-8822"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Website URL</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="e.g. https://quietford.com"
                  />
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Clinic Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--r-md)', background: 'var(--surface-3)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {logoMeta?.downloadURL ? (
                        <img src={logoMeta.downloadURL} alt="Clinic logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Upload className="w-5 h-5 text-wise-muted" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="logoUpload" 
                        style={{ display: 'none' }} 
                        onChange={handleLogoUpload} 
                        disabled={logoUploading}
                      />
                      <label htmlFor="logoUpload" className="btn btn-soft btn-sm cursor-pointer inline-flex items-center gap-1.5">
                        {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Choose logo image</span>
                      </label>
                      <div className="text-[11.5px] text-wise-muted mt-1.5">
                        {logoMeta ? `${logoMeta.fileName} (${(logoMeta.fileSize / 1024).toFixed(1)} KB)` : 'Optional placeholder preview. Maximum size 5MB.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Credentials */}
          <div className="form-section">
            <div className="inner">
              <h3>2. Clinic Credentials &amp; Licensure</h3>
              <p className="sub">Provide clinic licensing and registrations for admin verification. Not visible to the public.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Business License Number / Facility ID</label>
                  <input 
                    className="input mono" 
                    type="text" 
                    value={businessLicense} 
                    onChange={e => setBusinessLicense(e.target.value)}
                    required
                    placeholder="e.g. BUS-QCC-9921"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Registration State</label>
                  <select 
                    className="select" 
                    value={licenseState} 
                    onChange={e => setLicenseState(e.target.value)}
                  >
                    <option>California</option>
                    <option>Oregon</option>
                    <option>Washington</option>
                    <option>Texas</option>
                    <option>New York</option>
                  </select>
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Accreditations or Certifications (e.g. CARF, Joint Commission)</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={accreditation} 
                    onChange={e => setAccreditation(e.target.value)}
                    placeholder="e.g. CARF International Accredited"
                  />
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Accreditation/License Document Link</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText className="w-5 h-5 text-wise-muted" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,image/*" 
                        id="docUpload" 
                        style={{ display: 'none' }} 
                        onChange={handleDocUpload} 
                        disabled={docUploading}
                      />
                      <label htmlFor="docUpload" className="btn btn-soft btn-sm cursor-pointer inline-flex items-center gap-1.5">
                        {docUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Upload credential document</span>
                      </label>
                      <div className="text-[11.5px] text-wise-muted mt-1.5">
                        {docMeta ? `${docMeta.fileName} (${(docMeta.fileSize / 1024).toFixed(1)} KB)` : 'Demo upload only. Do not upload real medical, legal, or credential documents.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Care parameters */}
          <div className="form-section">
            <div className="inner">
              <h3>3. Clinic Service Parameters</h3>
              <p className="sub">These clinical configurations determine patient matchmaking scores.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field md:col-span-2">
                  <label className="field-label font-bold">Specialty Focus Areas (Select tags)</label>
                  <div className="tag-row flex flex-wrap gap-2 mt-2">
                    {ALL_SPECIALTIES.map(t => {
                      const isSelected = selectedSpecs.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleSpecialty(t)}
                          className={`badge cursor-pointer transition-all ${isSelected ? 'teal' : ''}`}
                        >
                          {isSelected && <span className="dot"></span>}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="field md:col-span-2">
                  <label className="field-label font-bold">Accepted Coverages &amp; Insurances</label>
                  <div className="tag-row flex flex-wrap gap-2 mt-2">
                    {ALL_INSURANCES.map(t => {
                      const isSelected = selectedInsurances.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleInsurance(t)}
                          className={`badge cursor-pointer transition-all ${isSelected ? 'teal' : ''}`}
                        >
                          {isSelected && <span className="dot"></span>}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Meeting modality</label>
                  <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['Telehealth', 'In-person', 'Both'] as const).map(o => (
                      <button 
                        key={o}
                        type="button"
                        onClick={() => setModality(o)}
                        className={`choice ${modality === o ? 'selected' : ''}`}
                        style={{ padding: '10px' }}
                      >
                        <span className="label" style={{ fontSize: '13px' }}>{o}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Locations Covered (comma-separated states)</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={locationsText} 
                    onChange={e => setLocationsText(e.target.value)}
                    placeholder="e.g. California, Oregon"
                    required
                  />
                </div>

                <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', padding: '14px', background: 'var(--surface-2)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px' }}>Sliding Scale Available</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Offer rates tailored to patient income.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={slidingScaleAvailable} 
                    onChange={e => setSlidingScaleAvailable(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Active Clinician Count</label>
                  <input 
                    className="input" 
                    type="number" 
                    min={1}
                    value={clinicianCount} 
                    onChange={e => setClinicianCount(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="field md:col-span-2">
                  <label className="field-label">Available matching hours</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                    <input 
                      className="input" 
                      type="text" 
                      style={{ width: '100%' }}
                      value={hours} 
                      onChange={e => setHours(e.target.value)}
                      placeholder="e.g. Mon-Fri · 9am - 5pm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!hours.trim()) return;
                        setIsEnhancing(true);
                        try {
                          const res = await fetch('/api/ai/enhance-hours', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rawHours: hours }),
                          });
                          const data = await res.json();
                          if (data.enhanced) {
                            setHours(data.enhanced);
                          }
                        } catch (err) {
                          console.error("Failed to enhance availability:", err);
                        } finally {
                          setIsEnhancing(false);
                        }
                      }}
                      disabled={isEnhancing || !hours.trim()}
                      className="btn btn-soft"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Cleaning...</span>
                        </>
                      ) : (
                        '✨ AI Enhance'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Professional References */}
          <div className="form-section">
            <div className="inner">
              <h3>4. Clinic References</h3>
              <p className="sub">Provide two professional peers or regulators for credential confirmation audits.</p>
              
              <div style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 10px' }}>Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="field">
                    <label className="field-label">Name / Body Name</label>
                    <input className="input" type="text" value={ref1Name} onChange={e => setRef1Name(e.target.value)} required placeholder="e.g. CARF Inspector Division" />
                  </div>
                  <div className="field">
                    <label className="field-label">Relationship</label>
                    <input className="input" type="text" value={ref1Relationship} onChange={e => setRef1Relationship(e.target.value)} required placeholder="e.g. Accreditation Body" />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" value={ref1Email} onChange={e => setRef1Email(e.target.value)} required placeholder="e.g. verify@carf.org" />
                  </div>
                  <div className="field">
                    <label className="field-label">Audit Status</label>
                    <select className="select" value={ref1Status} onChange={e => setRef1Status(e.target.value as any)}>
                      <option value="not_sent">Not sent</option>
                      <option value="requested">Requested</option>
                      <option value="received">Received</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 10px' }}>Reference 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="field">
                    <label className="field-label">Name / Body Name</label>
                    <input className="input" type="text" value={ref2Name} onChange={e => setRef2Name(e.target.value)} required placeholder="e.g. State Health Board" />
                  </div>
                  <div className="field">
                    <label className="field-label">Relationship</label>
                    <input className="input" type="text" value={ref2Relationship} onChange={e => setRef2Relationship(e.target.value)} required placeholder="e.g. Licensing Liaison" />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" value={ref2Email} onChange={e => setRef2Email(e.target.value)} required placeholder="e.g. auditor@statehealth.org" />
                  </div>
                  <div className="field">
                    <label className="field-label">Audit Status</label>
                    <select className="select" value={ref2Status} onChange={e => setRef2Status(e.target.value as any)}>
                      <option value="not_sent">Not sent</option>
                      <option value="requested">Requested</option>
                      <option value="received">Received</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prototype Safety Notice */}
          <div className="notice flex gap-3.5 items-start">
            <Lock className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-wise-muted">
              <strong style={{ color: 'var(--fg)' }}>Demo Security Notice.</strong> This is a demo verification workflow. Wise Care does not perform real provider credential verification in this prototype. Do not upload real medical, legal, or credential documents.
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex justify-between items-center pt-4 gap-3 flex-wrap">
            <Link href="/provider/org/dashboard" className="btn btn-ghost flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </Link>
            <button type="submit" className="btn btn-primary flex items-center gap-1.5">
              Submit practice parameters <span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}

export default function OrgProviderRegister() {
  return (
    <ProtectedRoute allowedRoles={['provider_org']}>
      <OrgProviderRegisterContent />
    </ProtectedRoute>
  );
}
