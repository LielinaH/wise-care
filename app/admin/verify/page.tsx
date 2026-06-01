'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage } from '@/lib/storage';
import { Check, Info, AlertTriangle, Clock, ArrowRight, ArrowLeft, Loader2, ChevronDown, ChevronUp, FileText, ExternalLink, XCircle, HelpCircle, Building } from 'lucide-react';
import Notice from '@/components/ui/Notice';

interface PendingQueueItem {
  id: string;
  providerId: string;
  providerType: 'solo_provider' | 'provider_org';
  name: string;
  licenseSummary: string;
  state: string;
  submittedDateText: string;
  profileData: any;
}

export default function AdminVerify() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminVerifyContent />
    </ProtectedRoute>
  );
}

function AdminVerifyContent() {
  const { currentUser, isFirebaseMode } = useAuth();
  const [pending, setPending] = useState<PendingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Accordion expanded states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    credentials: true,
    clinical: false,
    references: false,
    profile: false,
  });

  // Local checklist state for the selected provider
  const [localItemStatuses, setLocalItemStatuses] = useState<Record<string, 'pending' | 'verified' | 'needs_info' | 'rejected'>>({});
  const [localItemNotes, setLocalItemNotes] = useState<Record<string, string>>({});
  const [generalAdminNotes, setGeneralAdminNotes] = useState<string>('');
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load pending list from Firestore or local storage
  const loadVerificationQueue = async () => {
    setLoading(true);
    if (isFirebaseMode) {
      try {
        const { solo, org } = await firestoreHelpers.getAllProviders();
        
        const soloPending = solo
          .filter(s => (s.verification?.verificationStatus || s.verificationStatus || 'draft') === 'pending')
          .map(s => ({
            id: s.userId,
            providerId: s.userId,
            providerType: 'solo_provider' as const,
            name: s.profile?.displayName || s.displayName || `Solo Clinician (${s.userId.substring(0, 5)})`,
            licenseSummary: `${s.licensure?.licenseType || s.licenseType || 'LMFT'} · ${s.licensure?.licenseNumberPlaceholder || s.licenseNumberPlaceholder || 'No License #'}`,
            state: s.licensure?.licenseState || s.licenseState || 'N/A',
            submittedDateText: s.verification?.submittedAt 
              ? new Date(s.verification.submittedAt).toLocaleDateString()
              : 'Pending',
            profileData: s,
          }));

        const orgPending = org
          .filter(o => (o.verification?.verificationStatus || o.verificationStatus || 'draft') === 'pending')
          .map(o => ({
            id: o.orgId,
            providerId: o.orgId,
            providerType: 'provider_org' as const,
            name: o.organizationProfile?.organizationName || o.organizationName || `Clinic (${o.orgId.substring(0, 5)})`,
            licenseSummary: `${o.organizationProfile?.organizationType || o.organizationType || 'Group Practice'} · ${o.credentialInfo?.businessLicensePlaceholder || 'No License #'}`,
            state: o.credentialInfo?.licenseState || (o.locations ? o.locations[0] : 'N/A'),
            submittedDateText: o.verification?.submittedAt 
              ? new Date(o.verification.submittedAt).toLocaleDateString()
              : 'Pending',
            profileData: o,
          }));

        const combined = [...soloPending, ...orgPending];
        setPending(combined);
        if (combined.length > 0) {
          setSelectedId(combined[0].id);
        } else {
          setSelectedId('');
        }
      } catch (e) {
        console.error("Error loading pending providers:", e);
        showToast("Error reading pending providers from Firestore");
      }
    } else {
      // Fallback local storage pending simulation
      const stored = storage.getStorageItem<any[]>('wisecare.pendingProvidersMock', []);
      if (stored && stored.length > 0) {
        setPending(stored);
        if (stored.length > 0) setSelectedId(stored[0].id);
      } else {
        const initialMock: PendingQueueItem[] = [
          {
            id: 'mock_solo_pending_01',
            providerId: 'mock_solo_pending_01',
            providerType: 'solo_provider',
            name: 'Dr. Clara Watson, Psy.D.',
            licenseSummary: 'Psy.D. · California #PSY99881',
            state: 'California',
            submittedDateText: new Date().toLocaleDateString(),
            profileData: {
              userId: 'mock_solo_pending_01',
              profile: {
                displayName: 'Dr. Clara Watson, Psy.D.',
                providerTitle: 'Clinical Psychologist',
                bio: 'Specializing in evidence-based therapy for anxiety, burnout, and relationship concerns.',
                profilePhoto: null,
                contactEmail: 'clara.watson@example.com',
                contactPhone: '555-0101',
              },
              licensure: {
                licenseType: 'Psy.D.',
                licenseNumberPlaceholder: 'PSY99881',
                licenseState: 'California',
                licenseExpirationDate: '2028-09-30',
                licenseDocument: {
                  fileName: 'clara_psychology_license.pdf',
                  fileType: 'application/pdf',
                  fileSize: 1048576,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: 'mock_solo_pending_01',
                  demoOnly: true,
                  downloadURL: null,
                  storagePath: null,
                },
                npiPlaceholder: '1928374650',
                telehealthStates: ['California', 'Oregon'],
              },
              careDetails: {
                specialties: ['Anxiety', 'Burnout', 'Relationships'],
                modalities: ['Telehealth', 'In-person'],
                acceptedCoverageOptions: ['Aetna', 'BCBS', 'Self-pay'],
                selfPayRate: '$180',
                slidingScaleAvailable: true,
                languages: ['English', 'Spanish'],
                availability: 'Tue/Thu afternoons · 1-5pm',
              },
              references: {
                reference1Name: 'Dr. Marcus Aurelius',
                reference1Relationship: 'Clinical Supervisor',
                reference1Email: 'marcus.a@clinic.org',
                reference1Status: 'received',
                reference2Name: 'Sarah Jenkins, LMFT',
                reference2Relationship: 'Peer Group Lead',
                reference2Email: 'sarah.j@peerconnect.com',
                reference2Status: 'requested',
              },
              verification: {
                verificationStatus: 'pending',
                adminNotes: 'Awaiting secondary reference response.',
                itemStatuses: {
                  identity: 'verified',
                  licensure: 'pending',
                  clinical: 'verified',
                  references: 'pending',
                },
                itemNotes: {
                  licensure: 'Verification of state DB pending.',
                },
                submittedAt: new Date().toISOString(),
              }
            }
          }
        ];
        setPending(initialMock);
        storage.setStorageItem('wisecare.pendingProvidersMock', initialMock);
        if (initialMock.length > 0) setSelectedId(initialMock[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVerificationQueue();
  }, [currentUser, isFirebaseMode]);

  // Sync selected provider data into local audit states
  const selectedItem = pending.find(p => p.id === selectedId);

  useEffect(() => {
    if (selectedItem) {
      const v = selectedItem.profileData?.verification;
      setLocalItemStatuses({
        licensure: v?.itemStatuses?.licensure || 'pending',
        clinical: v?.itemStatuses?.clinical || 'pending',
        references: v?.itemStatuses?.references || 'pending',
        identity: v?.itemStatuses?.identity || 'pending',
      });
      setLocalItemNotes({
        licensure: v?.itemNotes?.licensure || '',
        clinical: v?.itemNotes?.clinical || '',
        references: v?.itemNotes?.references || '',
        identity: v?.itemNotes?.identity || '',
      });
      setGeneralAdminNotes(v?.adminNotes || '');
    }
  }, [selectedId, pending]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleItemStatusChange = (section: string, status: 'pending' | 'verified' | 'needs_info' | 'rejected') => {
    setLocalItemStatuses(prev => ({
      ...prev,
      [section]: status
    }));
  };

  const handleItemNoteChange = (section: string, note: string) => {
    setLocalItemNotes(prev => ({
      ...prev,
      [section]: note
    }));
  };

  const handleSaveResolution = async (status: 'verified' | 'request_info' | 'rejected') => {
    if (!selectedItem) return;
    setActionLoading(true);

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.updateProviderVerificationStatus(
          selectedItem.providerId,
          selectedItem.providerType,
          status,
          generalAdminNotes,
          localItemStatuses,
          localItemNotes
        );
        showToast(`Provider status updated to: ${status}`);
        
        // Remove verified/rejected items from queue list, refresh
        await loadVerificationQueue();
      } catch (e) {
        console.error("Error updating provider status:", e);
        showToast("Database write failed");
      }
    } else {
      // Mock resolution
      const updatedPending = pending.filter(p => p.id !== selectedId);
      setPending(updatedPending);
      storage.setStorageItem('wisecare.pendingProvidersMock', updatedPending);
      showToast(`Provider status updated to: ${status} (Simulation)`);
      if (updatedPending.length > 0) {
        setSelectedId(updatedPending[0].id);
      } else {
        setSelectedId('');
      }
    }
    setActionLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'needs_info': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="w-3.5 h-3.5 text-emerald-600" />;
      case 'needs_info': return <HelpCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(/[ \-\u2014]+/)
      .slice(0, 2)
      .map(s => s[0])
      .join('')
      .toUpperCase();
  };

  // Safe checks for references counting (No placeholders like "2 of 2" unless actual)
  const countReceivedReferences = (refs: any): number => {
    if (!refs) return 0;
    let count = 0;
    if (refs.reference1Status === 'received') count++;
    if (refs.reference2Status === 'received') count++;
    return count;
  };

  const getReferencesText = (refs: any): string => {
    if (!refs) return "0 of 0 received";
    let total = 0;
    if (refs.reference1Name || refs.reference1Email) total++;
    if (refs.reference2Name || refs.reference2Email) total++;
    const received = countReceivedReferences(refs);
    return `${received} of ${total} received`;
  };

  if (loading) {
    return (
      <AppShell title="Provider verification" crumbs={['Operations', 'Verification']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Clock className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Loading verification queue...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="Provider verification" 
      crumbs={['Operations', 'Verification']}
      actions={
        <Link href="/admin/dashboard" className="btn btn-ghost btn-sm text-xs font-semibold">Dashboard</Link>
      }
    >
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-wise-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="enter">
        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Verification queue · {pending.length} pending</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Provider verification.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px' }}>
            Review credential evidence, modalities, and reference responses before activating directory publication.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center text-xs text-wise-muted italic bg-wise-surface border border-dashed border-wise-border rounded-2xl">
            All provider listing applications have been resolved. Verification queue is empty!
          </div>
        ) : (
          <div className="verify-grid">
            
            {/* Queue List (Left Column) */}
            <div className="queue">
              <div className="queue-head">
                <span>QUEUE · {pending.length}</span>
                <span>SLA: 2 BUSINESS DAYS</span>
              </div>
              <div className="divide-y divide-wise-hairline">
                {pending.map(pp => (
                  <div 
                    key={pp.id}
                    className={`q-item ${pp.id === selectedId ? 'selected' : ''}`}
                    onClick={() => setSelectedId(pp.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{pp.name}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{pp.submittedDateText}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{pp.licenseSummary}</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span className="badge">{pp.state}</span>
                      <span className="badge teal">{pp.providerType === 'solo_provider' ? 'Solo Practitioner' : 'Clinic/Org'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Detail Pane (Right Column) */}
            {selectedItem && (
              <div className="space-y-4">
                <div className="card p-6 shadow-md border border-wise-border bg-wise-surface">
                  <div className="card-head flex justify-between items-start mb-6">
                    <div>
                      <h3 className="h3">{selectedItem.name}</h3>
                      <div className="sub text-wise-muted text-xs">
                        Type: {selectedItem.providerType === 'solo_provider' ? 'Solo Clinician' : 'Clinic Group'} · Registered State: {selectedItem.state}
                      </div>
                    </div>
                    <span className="badge warn"><span className="dot"></span>UNDER REVIEW</span>
                  </div>

                  {/* Expandable Accordions */}
                  <div className="space-y-4 mb-6">
                    
                    {/* ACCORDION 1: Licensure & Credentials Evidence */}
                    <div className="border border-wise-hairline rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => toggleSection('credentials')}
                        className="w-full flex justify-between items-center p-4 bg-wise-surface-2 hover:bg-wise-surface-3 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-wise-teal" />
                          <span className="font-semibold text-sm">1. Licensure &amp; Credentials Evidence</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ml-2 inline-flex items-center gap-1 ${getStatusBadgeClass(localItemStatuses.licensure)}`}>
                            {renderStatusIcon(localItemStatuses.licensure)}
                            <span>{localItemStatuses.licensure?.toUpperCase()}</span>
                          </span>
                        </div>
                        {expandedSections.credentials ? <ChevronUp className="w-4 h-4 text-wise-muted" /> : <ChevronDown className="w-4 h-4 text-wise-muted" />}
                      </button>
                      
                      {expandedSections.credentials && (
                        <div className="p-4 bg-wise-surface border-t border-wise-hairline space-y-4">
                          {selectedItem.providerType === 'solo_provider' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-wise-muted block">License Type</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.licensure?.licenseType || selectedItem.profileData?.licenseType}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">License State</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.licensure?.licenseState || selectedItem.profileData?.licenseState}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">License Number</span>
                                <span className="font-medium text-sm font-mono">{selectedItem.profileData?.licensure?.licenseNumberPlaceholder || selectedItem.profileData?.licenseNumberPlaceholder || 'Not Provided'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Expiration Date</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.licensure?.licenseExpirationDate || 'Not Provided'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">NPI</span>
                                <span className="font-medium text-sm font-mono">{selectedItem.profileData?.licensure?.npiPlaceholder || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Telehealth States</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.licensure?.telehealthStates?.join(', ') || 'N/A'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-wise-muted block">Business License / Facility ID</span>
                                <span className="font-medium text-sm font-mono">{selectedItem.profileData?.credentialInfo?.businessLicensePlaceholder || 'Not Provided'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Registration State</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.credentialInfo?.licenseState || 'N/A'}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-wise-muted block">Accreditations / Certifications</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.credentialInfo?.accreditationPlaceholder || 'None listed'}</span>
                              </div>
                            </div>
                          )}

                          {/* Credential Document File Links */}
                          <div className="pt-3 border-t border-wise-hairline text-xs">
                            <span className="text-wise-muted block mb-2 font-semibold">Submitted Credentials Scan</span>
                            {selectedItem.providerType === 'solo_provider' ? (
                              selectedItem.profileData?.licensure?.licenseDocument ? (
                                <div className="flex items-center justify-between p-2 bg-wise-surface-2 rounded border border-wise-hairline">
                                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                                    <FileText className="w-4 h-4 text-rose-700 shrink-0" />
                                    <span className="truncate font-medium">{selectedItem.profileData.licensure.licenseDocument.fileName}</span>
                                    <span className="text-[10px] text-wise-muted">({(selectedItem.profileData.licensure.licenseDocument.fileSize / 1024).toFixed(1)} KB)</span>
                                  </div>
                                  {selectedItem.profileData.licensure.licenseDocument.downloadURL ? (
                                    <a 
                                      href={selectedItem.profileData.licensure.licenseDocument.downloadURL} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="btn btn-soft btn-xs text-[11px] flex items-center gap-1 shrink-0"
                                    >
                                      View File <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-amber-600 font-semibold italic text-[11px]">Demo File metadata (No upload)</span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-wise-muted italic">No license document scan uploaded.</div>
                              )
                            ) : (
                              selectedItem.profileData?.credentialInfo?.credentialDocument ? (
                                <div className="flex items-center justify-between p-2 bg-wise-surface-2 rounded border border-wise-hairline">
                                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                                    <FileText className="w-4 h-4 text-rose-700 shrink-0" />
                                    <span className="truncate font-medium">{selectedItem.profileData.credentialInfo.credentialDocument.fileName}</span>
                                    <span className="text-[10px] text-wise-muted">({(selectedItem.profileData.credentialInfo.credentialDocument.fileSize / 1024).toFixed(1)} KB)</span>
                                  </div>
                                  {selectedItem.profileData.credentialInfo.credentialDocument.downloadURL ? (
                                    <a 
                                      href={selectedItem.profileData.credentialInfo.credentialDocument.downloadURL} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="btn btn-soft btn-xs text-[11px] flex items-center gap-1 shrink-0"
                                    >
                                      View File <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-amber-600 font-semibold italic text-[11px]">Demo File metadata (No upload)</span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-wise-muted italic">No accreditation document scan uploaded.</div>
                              )
                            )}
                          </div>

                          {/* Item status selection controls */}
                          <div className="pt-3 border-t border-wise-hairline">
                            <span className="text-wise-muted text-xs block font-semibold mb-1.5">Audit Credential Status</span>
                            <div className="flex gap-2 mb-2">
                              {(['pending', 'verified', 'needs_info', 'rejected'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleItemStatusChange('licensure', st)}
                                  className={`btn btn-xs ${localItemStatuses.licensure === st ? 'btn-primary' : 'btn-soft'}`}
                                >
                                  {st.replace('_', ' ').toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              className="input text-xs w-full"
                              placeholder="Notes on credential audit (e.g. verified state register DB)..."
                              value={localItemNotes.licensure || ''}
                              onChange={e => handleItemNoteChange('licensure', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 2: Clinical Modalities & Specialties */}
                    <div className="border border-wise-hairline rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => toggleSection('clinical')}
                        className="w-full flex justify-between items-center p-4 bg-wise-surface-2 hover:bg-wise-surface-3 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-wise-teal" />
                          <span className="font-semibold text-sm">2. Clinical Modalities &amp; Specialties</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ml-2 inline-flex items-center gap-1 ${getStatusBadgeClass(localItemStatuses.clinical)}`}>
                            {renderStatusIcon(localItemStatuses.clinical)}
                            <span>{localItemStatuses.clinical?.toUpperCase()}</span>
                          </span>
                        </div>
                        {expandedSections.clinical ? <ChevronUp className="w-4 h-4 text-wise-muted" /> : <ChevronDown className="w-4 h-4 text-wise-muted" />}
                      </button>

                      {expandedSections.clinical && (
                        <div className="p-4 bg-wise-surface border-t border-wise-hairline space-y-4">
                          {selectedItem.providerType === 'solo_provider' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="md:col-span-2">
                                <span className="text-wise-muted block">Specialties</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(selectedItem.profileData?.careDetails?.specialties || selectedItem.profileData?.specialties || []).map((s: string) => (
                                    <span key={s} className="badge">{s}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Modalities</span>
                                <span className="font-medium text-sm">{(selectedItem.profileData?.careDetails?.modalities || selectedItem.profileData?.modalities || []).join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Self Pay Rate</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.careDetails?.selfPayRate || 'Not listed'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Sliding Scale</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.careDetails?.slidingScaleAvailable ? 'Available' : 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Languages</span>
                                <span className="font-medium text-sm">{(selectedItem.profileData?.careDetails?.languages || []).join(', ') || 'English'}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-wise-muted block">Availability / Hours</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.careDetails?.availability || selectedItem.profileData?.availability}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="md:col-span-2">
                                <span className="text-wise-muted block">Specialties</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(selectedItem.profileData?.serviceDetails?.specialties || selectedItem.profileData?.specialties || []).map((s: string) => (
                                    <span key={s} className="badge">{s}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Modalities</span>
                                <span className="font-medium text-sm">{(selectedItem.profileData?.serviceDetails?.modalities || selectedItem.profileData?.modalities || []).join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Locations Covered</span>
                                <span className="font-medium text-sm">{(selectedItem.profileData?.serviceDetails?.locations || selectedItem.profileData?.locations || []).join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Insurances Accepted</span>
                                <span className="font-medium text-sm">{(selectedItem.profileData?.serviceDetails?.acceptedCoverageOptions || selectedItem.profileData?.coverageOptions || []).join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Sliding Scale</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.serviceDetails?.slidingScaleAvailable ? 'Available' : 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Clinician Count</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.serviceDetails?.clinicianCount || 1}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-wise-muted block">Availability</span>
                                <span className="font-medium text-sm">{selectedItem.profileData?.serviceDetails?.availability || selectedItem.profileData?.availability}</span>
                              </div>
                            </div>
                          )}

                          {/* Item status selection controls */}
                          <div className="pt-3 border-t border-wise-hairline">
                            <span className="text-wise-muted text-xs block font-semibold mb-1.5">Audit Clinical Profile Status</span>
                            <div className="flex gap-2 mb-2">
                              {(['pending', 'verified', 'needs_info', 'rejected'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleItemStatusChange('clinical', st)}
                                  className={`btn btn-xs ${localItemStatuses.clinical === st ? 'btn-primary' : 'btn-soft'}`}
                                >
                                  {st.replace('_', ' ').toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              className="input text-xs w-full"
                              placeholder="Notes on specialties/modalities validation..."
                              value={localItemNotes.clinical || ''}
                              onChange={e => handleItemNoteChange('clinical', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 3: Professional References Audit */}
                    <div className="border border-wise-hairline rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => toggleSection('references')}
                        className="w-full flex justify-between items-center p-4 bg-wise-surface-2 hover:bg-wise-surface-3 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-wise-teal" />
                          <span className="font-semibold text-sm">3. Professional References Audit</span>
                          <span className="text-xs text-wise-muted ml-2">
                            ({getReferencesText(selectedItem.profileData?.references)})
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ml-2 inline-flex items-center gap-1 ${getStatusBadgeClass(localItemStatuses.references)}`}>
                            {renderStatusIcon(localItemStatuses.references)}
                            <span>{localItemStatuses.references?.toUpperCase()}</span>
                          </span>
                        </div>
                        {expandedSections.references ? <ChevronUp className="w-4 h-4 text-wise-muted" /> : <ChevronDown className="w-4 h-4 text-wise-muted" />}
                      </button>

                      {expandedSections.references && (
                        <div className="p-4 bg-wise-surface border-t border-wise-hairline space-y-4">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {selectedItem.profileData?.references?.reference1Name ? (
                              <div className="p-3 bg-wise-surface-2 rounded border border-wise-hairline text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <strong className="text-sm font-semibold">{selectedItem.profileData.references.reference1Name}</strong>
                                  <span className={`badge ${selectedItem.profileData.references.reference1Status === 'received' ? 'success' : 'warn'}`}>
                                    {selectedItem.profileData.references.reference1Status?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="space-y-0.5 text-wise-muted">
                                  <div>Relationship: {selectedItem.profileData.references.reference1Relationship}</div>
                                  <div>Email: {selectedItem.profileData.references.reference1Email}</div>
                                  {selectedItem.profileData.references.reference1Phone && <div>Phone: {selectedItem.profileData.references.reference1Phone}</div>}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-wise-muted italic">Reference 1 details are missing.</div>
                            )}

                            {selectedItem.profileData?.references?.reference2Name ? (
                              <div className="p-3 bg-wise-surface-2 rounded border border-wise-hairline text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <strong className="text-sm font-semibold">{selectedItem.profileData.references.reference2Name}</strong>
                                  <span className={`badge ${selectedItem.profileData.references.reference2Status === 'received' ? 'success' : 'warn'}`}>
                                    {selectedItem.profileData.references.reference2Status?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="space-y-0.5 text-wise-muted">
                                  <div>Relationship: {selectedItem.profileData.references.reference2Relationship}</div>
                                  <div>Email: {selectedItem.profileData.references.reference2Email}</div>
                                  {selectedItem.profileData.references.reference2Phone && <div>Phone: {selectedItem.profileData.references.reference2Phone}</div>}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-wise-muted italic">Reference 2 details are missing.</div>
                            )}
                          </div>

                          {/* Item status selection controls */}
                          <div className="pt-3 border-t border-wise-hairline">
                            <span className="text-wise-muted text-xs block font-semibold mb-1.5">Audit References Status</span>
                            <div className="flex gap-2 mb-2">
                              {(['pending', 'verified', 'needs_info', 'rejected'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleItemStatusChange('references', st)}
                                  className={`btn btn-xs ${localItemStatuses.references === st ? 'btn-primary' : 'btn-soft'}`}
                                >
                                  {st.replace('_', ' ').toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              className="input text-xs w-full"
                              placeholder="Notes on professional reference feedback..."
                              value={localItemNotes.references || ''}
                              onChange={e => handleItemNoteChange('references', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 4: Administrative Profile */}
                    <div className="border border-wise-hairline rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => toggleSection('profile')}
                        className="w-full flex justify-between items-center p-4 bg-wise-surface-2 hover:bg-wise-surface-3 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-wise-teal" />
                          <span className="font-semibold text-sm">4. Administrative Profile Details</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ml-2 inline-flex items-center gap-1 ${getStatusBadgeClass(localItemStatuses.identity)}`}>
                            {renderStatusIcon(localItemStatuses.identity)}
                            <span>{localItemStatuses.identity?.toUpperCase()}</span>
                          </span>
                        </div>
                        {expandedSections.profile ? <ChevronUp className="w-4 h-4 text-wise-muted" /> : <ChevronDown className="w-4 h-4 text-wise-muted" />}
                      </button>

                      {expandedSections.profile && (
                        <div className="p-4 bg-wise-surface border-t border-wise-hairline space-y-4">
                          {selectedItem.providerType === 'solo_provider' ? (
                            <div className="space-y-3 text-xs">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-3)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  {selectedItem.profileData?.profile?.profilePhoto?.downloadURL ? (
                                    <img src={selectedItem.profileData.profile.profilePhoto.downloadURL} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span className="text-[10px] text-wise-muted">No Photo</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-sm block">{selectedItem.profileData?.profile?.displayName || selectedItem.profileData?.displayName}</span>
                                  <span className="text-wise-muted">{selectedItem.profileData?.profile?.providerTitle || selectedItem.profileData?.licenseType}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Provider Bio</span>
                                <p className="p-2.5 bg-wise-surface-2 rounded border border-wise-hairline italic text-[12.5px] text-wise-fg mt-1">
                                  {selectedItem.profileData?.profile?.bio || 'No bio submitted.'}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-wise-muted block">Contact Email</span>
                                  <span className="font-medium">{selectedItem.profileData?.profile?.contactEmail || selectedItem.profileData?.contactEmail || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-wise-muted block">Contact Phone</span>
                                  <span className="font-medium">{selectedItem.profileData?.profile?.contactPhone || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 text-xs">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  {selectedItem.profileData?.organizationProfile?.logo?.downloadURL ? (
                                    <img src={selectedItem.profileData.organizationProfile.logo.downloadURL} alt="Clinic logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span className="text-[10px] text-wise-muted">No Logo</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-sm block">{selectedItem.profileData?.organizationProfile?.organizationName || selectedItem.profileData?.organizationName}</span>
                                  <span className="text-wise-muted">Type: {selectedItem.profileData?.organizationProfile?.organizationType || selectedItem.profileData?.organizationType}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-wise-muted block">Clinic Bio / Overview</span>
                                <p className="p-2.5 bg-wise-surface-2 rounded border border-wise-hairline italic text-[12.5px] text-wise-fg mt-1">
                                  {selectedItem.profileData?.organizationProfile?.organizationBio || 'No overview submitted.'}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-wise-muted block">Primary Contact</span>
                                  <span className="font-medium">{selectedItem.profileData?.organizationProfile?.primaryContactName || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-wise-muted block">Primary Email</span>
                                  <span className="font-medium">{selectedItem.profileData?.organizationProfile?.primaryContactEmail || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-wise-muted block">Primary Phone</span>
                                  <span className="font-medium">{selectedItem.profileData?.organizationProfile?.primaryContactPhone || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-wise-muted block">Website URL</span>
                                  <span className="font-medium">{selectedItem.profileData?.organizationProfile?.website || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Item status selection controls */}
                          <div className="pt-3 border-t border-wise-hairline">
                            <span className="text-wise-muted text-xs block font-semibold mb-1.5">Audit Identity Profile Status</span>
                            <div className="flex gap-2 mb-2">
                              {(['pending', 'verified', 'needs_info', 'rejected'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleItemStatusChange('identity', st)}
                                  className={`btn btn-xs ${localItemStatuses.identity === st ? 'btn-primary' : 'btn-soft'}`}
                                >
                                  {st.replace('_', ' ').toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              className="input text-xs w-full"
                              placeholder="Notes on profile identity checks..."
                              value={localItemNotes.identity || ''}
                              onChange={e => handleItemNoteChange('identity', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* General Admin Notes Input */}
                  <div className="mb-6">
                    <label className="field-label text-xs font-bold uppercase tracking-wider text-wise-muted mb-1 block">General Administrative Review Notes</label>
                    <textarea 
                      className="textarea text-xs w-full" 
                      rows={3} 
                      placeholder="Add general review notes / instructions for the provider..."
                      value={generalAdminNotes}
                      onChange={e => setGeneralAdminNotes(e.target.value)}
                    />
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-3 pt-4 border-t border-wise-hairline flex-wrap">
                    <button 
                      onClick={() => handleSaveResolution('verified')} 
                      disabled={actionLoading}
                      className="btn btn-primary text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Approve &amp; publish</span>
                    </button>
                    
                    <button 
                      onClick={() => handleSaveResolution('request_info')} 
                      disabled={actionLoading}
                      className="btn btn-soft text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
                      <span>Request more info</span>
                    </button>
                    
                    <button 
                      onClick={() => handleSaveResolution('rejected')} 
                      disabled={actionLoading}
                      className="btn btn-danger text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Reject</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* Prototype Safety Notice */}
        <div className="notice flex gap-3.5 items-start mt-6">
          <Info className="w-4.5 h-4.5 text-wise-teal shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-wise-muted">
            <strong style={{ color: 'var(--fg)' }}>Prototype note.</strong> This is a demo verification workflow. Wise Care does not perform real provider credential verification in this prototype. Do not upload real medical, legal, or credential documents.
          </div>
        </div>

      </div>
    </AppShell>
  );
}
