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
import { Check, Info, Lock, ArrowRight, ArrowLeft, Loader2, Upload, FileText } from 'lucide-react';
import Notice from '@/components/ui/Notice';

const ALL_SPECIALTIES = ['Anxiety', 'Burnout', 'Sleep', 'Relationships', 'Work stress', 'Caregiver stress', 'Depression', 'Trauma'];
const ALL_INSURANCES = ['Aetna', 'BCBS', 'Cigna', 'United', 'Self-pay', 'Marketplace Plan'];

function SoloProviderRegisterContent() {
  const router = useRouter();
  const { currentUser, isFirebaseMode } = useAuth();

  // Basic Profile
  const [displayName, setDisplayName] = useState('');
  const [providerTitle, setProviderTitle] = useState('LMFT');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [photoMeta, setPhotoMeta] = useState<FileMetadata | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Licensure
  const [licenseType, setLicenseType] = useState('LMFT');
  const [licensePlaceholder, setLicensePlaceholder] = useState('');
  const [licenseState, setLicenseState] = useState('California');
  const [licenseExpirationDate, setLicenseExpirationDate] = useState('');
  const [npiPlaceholder, setNpiPlaceholder] = useState('');
  const [telehealthStatesText, setTelehealthStatesText] = useState('California');
  const [docMeta, setDocMeta] = useState<FileMetadata | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  // Care details
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [modality, setModality] = useState<'Telehealth' | 'In-person' | 'Both'>('Telehealth');
  const [selfPayRate, setSelfPayRate] = useState('');
  const [slidingScaleAvailable, setSlidingScaleAvailable] = useState(false);
  const [languagesText, setLanguagesText] = useState('English');
  const [hours, setHours] = useState('Tue / Wed / Thu evenings');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // References
  const [ref1Name, setRef1Name] = useState('');
  const [ref1Relationship, setRef1Relationship] = useState('');
  const [ref1Email, setRef1Email] = useState('');
  const [ref1Phone, setRef1Phone] = useState('');
  const [ref1Status, setRef1Status] = useState<'not_sent' | 'requested' | 'received'>('requested');

  const [ref2Name, setRef2Name] = useState('');
  const [ref2Relationship, setRef2Relationship] = useState('');
  const [ref2Email, setRef2Email] = useState('');
  const [ref2Phone, setRef2Phone] = useState('');
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
          const profile = await firestoreHelpers.getSoloProviderProfile(currentUser.uid);
          if (profile) {
            // Basic Profile
            setDisplayName(profile.profile?.displayName || profile.displayName || '');
            setProviderTitle(profile.profile?.providerTitle || profile.licenseType || 'LMFT');
            setBio(profile.profile?.bio || '');
            setContactEmail(profile.profile?.contactEmail || currentUser.email || '');
            setContactPhone(profile.profile?.contactPhone || '');
            setPhotoMeta(profile.profile?.profilePhoto || null);

            // Licensure
            setLicenseType(profile.licensure?.licenseType || profile.licenseType || 'LMFT');
            setLicensePlaceholder(profile.licensure?.licenseNumberPlaceholder || profile.licenseNumberPlaceholder || '');
            setLicenseState(profile.licensure?.licenseState || profile.licenseState || 'California');
            setLicenseExpirationDate(profile.licensure?.licenseExpirationDate || '');
            setNpiPlaceholder(profile.licensure?.npiPlaceholder || '');
            setTelehealthStatesText(profile.licensure?.telehealthStates?.join(', ') || profile.licenseState || 'California');
            setDocMeta(profile.licensure?.licenseDocument || null);

            // Care details
            setSelectedSpecs(profile.careDetails?.specialties || profile.specialties || []);
            setSelectedInsurances(profile.careDetails?.acceptedCoverageOptions || profile.coverageOptions || []);
            setSelfPayRate(profile.careDetails?.selfPayRate || '');
            setSlidingScaleAvailable(profile.careDetails?.slidingScaleAvailable || false);
            setLanguagesText(profile.careDetails?.languages?.join(', ') || 'English');
            setHours(profile.careDetails?.availability || profile.availability || 'Accepting new clients');
            
            if (profile.careDetails?.modalities && profile.careDetails.modalities.length > 0) {
              const mods = profile.careDetails.modalities;
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
            setRef1Phone(profile.references?.reference1Phone || '');
            setRef1Status(profile.references?.reference1Status || 'requested');

            setRef2Name(profile.references?.reference2Name || '');
            setRef2Relationship(profile.references?.reference2Relationship || '');
            setRef2Email(profile.references?.reference2Email || '');
            setRef2Phone(profile.references?.reference2Phone || '');
            setRef2Status(profile.references?.reference2Status || 'requested');

            // Verification
            setVerificationStatus(profile.verification?.verificationStatus || profile.verificationStatus || 'draft');
            setAdminNotes(profile.verification?.adminNotes || '');
            setItemStatuses(profile.verification?.itemStatuses || {});
            setItemNotes(profile.verification?.itemNotes || {});
          } else {
            setContactEmail(currentUser.email || '');
          }
        } catch (e) {
          console.error("Error loading solo provider profile:", e);
        }
      } else {
        // Fallback
        const p = storage.getStorageItem<any>('wisecare.providers.solo', null);
        if (p) {
          setDisplayName(p.profile?.displayName || p.displayName || '');
          setProviderTitle(p.profile?.providerTitle || p.licenseType || 'LMFT');
          setBio(p.profile?.bio || '');
          setContactEmail(p.profile?.contactEmail || currentUser.email || '');
          setContactPhone(p.profile?.contactPhone || '');
          setLicenseType(p.licensure?.licenseType || p.licenseType || 'LMFT');
          setLicensePlaceholder(p.licensure?.licenseNumberPlaceholder || p.licenseNumberPlaceholder || '');
          setLicenseState(p.licensure?.licenseState || p.licenseState || 'California');
          setLicenseExpirationDate(p.licensure?.licenseExpirationDate || '');
          setSelectedSpecs(p.careDetails?.specialties || p.specialties || []);
          setSelectedInsurances(p.careDetails?.acceptedCoverageOptions || p.coverageOptions || []);
          setHours(p.careDetails?.availability || p.availability || 'Accepting new clients');
          setVerificationStatus(p.verification?.verificationStatus || p.verificationStatus || 'draft');
        } else {
          setDisplayName('Demo Clinician');
          setContactEmail(currentUser.email || 'doc@wisecare.test');
          setSelectedSpecs(['Anxiety', 'Sleep']);
          setSelectedInsurances(['BCBS', 'Self-pay']);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [currentUser, isFirebaseMode]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setPhotoUploading(true);
    try {
      const meta = await uploadProviderFile(currentUser.uid, 'photo', file);
      setPhotoMeta(meta);
      showToast('Photo uploaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setDocUploading(true);
    try {
      const meta = await uploadProviderFile(currentUser.uid, 'credential', file);
      setDocMeta(meta);
      showToast('Credential document uploaded successfully');
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

    // Structure profileData
    const profileData = {
      userId: currentUser.uid,
      profile: {
        displayName: displayName.trim(),
        providerTitle,
        bio: bio.trim(),
        profilePhoto: photoMeta,
        contactEmail: contactEmail.toLowerCase().trim(),
        contactPhone: contactPhone.trim(),
      },
      licensure: {
        licenseType,
        licenseNumberPlaceholder: licensePlaceholder.trim(),
        licenseState,
        licenseExpirationDate,
        licenseDocument: docMeta,
        npiPlaceholder: npiPlaceholder.trim(),
        telehealthStates: telehealthStatesText.split(',').map(s => s.trim()).filter(Boolean),
      },
      careDetails: {
        specialties: selectedSpecs,
        modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
        acceptedCoverageOptions: selectedInsurances,
        selfPayRate: selfPayRate.trim(),
        slidingScaleAvailable,
        languages: languagesText.split(',').map(l => l.trim()).filter(Boolean),
        availability: hours,
      },
      references: {
        reference1Name: ref1Name.trim(),
        reference1Relationship: ref1Relationship.trim(),
        reference1Email: ref1Email.toLowerCase().trim(),
        reference1Phone: ref1Phone.trim(),
        reference1Status: ref1Status,
        reference2Name: ref2Name.trim(),
        reference2Relationship: ref2Relationship.trim(),
        reference2Email: ref2Email.toLowerCase().trim(),
        reference2Phone: ref2Phone.trim(),
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
      // Keep legacy fields populated for safety/backward-compat
      displayName: displayName.trim(),
      licenseType,
      licenseState,
      licenseNumberPlaceholder: licensePlaceholder.trim(),
      specialties: selectedSpecs,
      modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
      coverageOptions: selectedInsurances,
      availability: hours,
      verificationStatus: verificationStatus === 'draft' ? 'pending' : verificationStatus,
    };

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.setSoloProviderProfile(currentUser.uid, profileData);
      } catch (e) {
        console.error("Error saving solo provider profile:", e);
        showToast("Database write failed. Review console logs.");
        return;
      }
    } else {
      storage.setStorageItem('wisecare.providers.solo', profileData);
    }

    setToastMsg('Profile details submitted successfully');
    setTimeout(() => {
      setToastMsg(null);
      router.push('/provider/solo/dashboard');
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

  return (
    <AppShell 
      title="Clinician Profile" 
      crumbs={['Practice', 'Profile']}
      actions={
        <Link href="/provider/solo/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Cancel</Link>
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
          <span className="kicker">Clinician Settings</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Edit practice parameters</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Enter your practice, licensure, and professional references evidence below. Only verified listings can receive patient matches.
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

          {/* Section 1: Basic Profile */}
          <div className="form-section">
            <div className="inner">
              <h3>1. Basic Profile Details</h3>
              <p className="sub">This information is shown to users on your directory profile card.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">Professional Name</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Jane Smith, Psy.D."
                  />
                </div>
                <div className="field">
                  <label className="field-label">Professional Title</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={providerTitle} 
                    onChange={e => setProviderTitle(e.target.value)}
                    required
                    placeholder="e.g. Clinical Social Worker, Child Psychologist"
                  />
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Bio &amp; Care Approach</label>
                  <textarea 
                    className="textarea" 
                    value={bio} 
                    onChange={e => setBio(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your care philosophy, approach, and how you help clients navigate wellness..."
                  />
                </div>
                <div className="field">
                  <label className="field-label">Contact Email</label>
                  <input 
                    className="input" 
                    type="email" 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Contact Phone</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. (555) 0192-8822"
                  />
                </div>
                <div className="field md:col-span-2">
                  <label className="field-label">Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-3)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {photoMeta?.downloadURL ? (
                        <img src={photoMeta.downloadURL} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Upload className="w-5 h-5 text-wise-muted" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="photoUpload" 
                        style={{ display: 'none' }} 
                        onChange={handlePhotoUpload} 
                        disabled={photoUploading}
                      />
                      <label htmlFor="photoUpload" className="btn btn-soft btn-sm cursor-pointer inline-flex items-center gap-1.5">
                        {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Choose profile photo</span>
                      </label>
                      <div className="text-[11.5px] text-wise-muted mt-1.5">
                        {photoMeta ? `${photoMeta.fileName} (${(photoMeta.fileSize / 1024).toFixed(1)} KB)` : 'Optional placeholder preview. Maximum size 5MB.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Licensure evidence */}
          <div className="form-section">
            <div className="inner">
              <h3>2. Credentials &amp; Licensure</h3>
              <p className="sub">Provide credentials for admin verification. Not visible to the general public.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field">
                  <label className="field-label">License Type</label>
                  <select 
                    className="select" 
                    value={licenseType} 
                    onChange={e => setLicenseType(e.target.value)}
                  >
                    <option>LMFT</option>
                    <option>LCSW</option>
                    <option>LPC</option>
                    <option>Psy.D.</option>
                    <option>Ph.D.</option>
                    <option>PMHNP</option>
                    <option>MD</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">License State</label>
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
                <div className="field">
                  <label className="field-label">License Number</label>
                  <input 
                    className="input mono" 
                    type="text" 
                    value={licensePlaceholder} 
                    onChange={e => setLicensePlaceholder(e.target.value)}
                    required
                    placeholder="e.g. LMF24-0918"
                  />
                </div>
                <div className="field">
                  <label className="field-label">License Expiration Date</label>
                  <input 
                    className="input" 
                    type="date" 
                    value={licenseExpirationDate} 
                    onChange={e => setLicenseExpirationDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">NPI (National Provider Identifier) - Optional</label>
                  <input 
                    className="input mono" 
                    type="text" 
                    value={npiPlaceholder} 
                    onChange={e => setNpiPlaceholder(e.target.value)}
                    placeholder="e.g. 1908772651"
                  />
                </div>
                <div className="field">
                  <label className="field-label">States eligible for telehealth matching (comma-separated)</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={telehealthStatesText} 
                    onChange={e => setTelehealthStatesText(e.target.value)}
                    placeholder="e.g. California, Oregon"
                  />
                </div>

                <div className="field md:col-span-2">
                  <label className="field-label">Credential/License Document Document Link</label>
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
              <h3>3. Clinical Focus &amp; Modality</h3>
              <p className="sub">These clinical configurations determine patient matchmaking scores.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                <div className="field md:col-span-2">
                  <label className="field-label font-bold">Specialty Focus Areas (Select focus tags)</label>
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
                  <label className="field-label">Self-Pay Session Rate</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={selfPayRate} 
                    onChange={e => setSelfPayRate(e.target.value)}
                    placeholder="e.g. $150 per session"
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
                  <label className="field-label">Languages Spoken (comma-separated)</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={languagesText} 
                    onChange={e => setLanguagesText(e.target.value)}
                    placeholder="e.g. English, Spanish"
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
                      placeholder="e.g. Weekday evenings · 5-8pm"
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
              <h3>4. Professional References</h3>
              <p className="sub">Provide two professional peers/supervisors for credential confirmation audits.</p>
              
              <div style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 10px' }}>Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="field">
                    <label className="field-label">Name</label>
                    <input className="input" type="text" value={ref1Name} onChange={e => setRef1Name(e.target.value)} required placeholder="e.g. Dr. Alex Marcus" />
                  </div>
                  <div className="field">
                    <label className="field-label">Relationship</label>
                    <input className="input" type="text" value={ref1Relationship} onChange={e => setRef1Relationship(e.target.value)} required placeholder="e.g. Former Supervisor" />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" value={ref1Email} onChange={e => setRef1Email(e.target.value)} required placeholder="e.g. alex@healthclinic.org" />
                  </div>
                  <div className="field">
                    <label className="field-label">Phone (Optional)</label>
                    <input className="input" type="text" value={ref1Phone} onChange={e => setRef1Phone(e.target.value)} placeholder="e.g. 555-0100" />
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
                    <label className="field-label">Name</label>
                    <input className="input" type="text" value={ref2Name} onChange={e => setRef2Name(e.target.value)} required placeholder="e.g. Sarah Jenkins, LMFT" />
                  </div>
                  <div className="field">
                    <label className="field-label">Relationship</label>
                    <input className="input" type="text" value={ref2Relationship} onChange={e => setRef2Relationship(e.target.value)} required placeholder="e.g. Peer Practitioner" />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" value={ref2Email} onChange={e => setRef2Email(e.target.value)} required placeholder="e.g. sarah.j@clinic.org" />
                  </div>
                  <div className="field">
                    <label className="field-label">Phone (Optional)</label>
                    <input className="input" type="text" value={ref2Phone} onChange={e => setRef2Phone(e.target.value)} placeholder="e.g. 555-0105" />
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
            <Link href="/provider/solo/dashboard" className="btn btn-ghost flex items-center gap-1.5">
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

export default function SoloProviderRegister() {
  return (
    <ProtectedRoute allowedRoles={['solo_provider']}>
      <SoloProviderRegisterContent />
    </ProtectedRoute>
  );
}
