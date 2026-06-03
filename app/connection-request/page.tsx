'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { storage } from '@/lib/storage';
import { Provider, Referral, CarePacket } from '@/lib/types';
import { MOCK_PROVIDERS } from '@/lib/data/mockProviders';
import { MOCK_REFERRALS } from '@/lib/data/mockReferrals';
import { Check, Send, ArrowLeft, ArrowRight, Loader2, Lock, Info } from 'lucide-react';
import Notice from '@/components/ui/Notice';
import PremiumCard from '@/components/ui/PremiumCard';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import PatientChatPanel from '@/components/wise-care/PatientChatPanel';

function ConnectionRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId') || searchParams.get('provider');
  const hasProviderIdParam = !!(searchParams.get('providerId') || searchParams.get('provider'));

  const { currentUser, isFirebaseMode } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [packet, setPacket] = useState<any | null>(null);
  const [consent, setConsent] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentRequestsList, setSentRequestsList] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  
  const [showModal, setShowModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [modalSlots, setModalSlots] = useState<{ date: string; timeSlots: string[]; }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingType, setBookingType] = useState('15-minute consultation');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);

  const [shareToggles, setShareToggles] = useState<Record<string, boolean>>({
    concerns: true,
    timeline: true,
    impact: true,
    goals: true,
    questions: true,
    insurance: true,
    safety: true,
  });

  const loadRequests = async () => {
    if (isFirebaseMode && currentUser) {
      try {
        const refs = await firestoreHelpers.getReferralsForPatient(currentUser.uid);
        const mapped = refs
          .filter(r => r.status !== 'withdrawn')
          .map(r => ({
            id: r.referralId || '',
            name: 'Member (Self)',
            route: `Therapy · ${r.providerType === 'solo_provider' ? 'Solo Clinician' : 'Clinic Group'}`,
            risk: 'low',
            age: 'Adult',
            received: r.createdAt && r.createdAt.seconds 
              ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() 
              : 'Just now',
            insurance: 'Coverage matched',
            summary: 'Care Packet shared',
            status: r.status,
            providerId: r.providerId,
            providerName: r.providerName,
            appointmentDate: r.appointmentDate,
            appointmentTimeSlot: r.appointmentTimeSlot,
            appointmentType: r.appointmentType,
            appointmentNotes: r.appointmentNotes,
          }));
        setSentRequestsList(mapped);
      } catch (e) {
        console.error("Error loading referrals: ", e);
      }
    } else {
      const allReferrals = storage.getReferrals();
      const userReferrals = allReferrals.filter(ref => ref.name === 'Member (Self)');
      setSentRequestsList(userReferrals);
    }
  };

  const handleOpenBookingModal = async (req: any) => {
    setSelectedReq(req);
    setShowModal(true);
    setBookingDate('');
    setBookingTime('');
    setBookingNotes('');
    setLoadingSlots(true);

    let availability = 'Accepting new clients';
    const foundProv = allProviders.find(p => p.id === req.providerId);
    if (foundProv) {
      availability = foundProv.nextAvailable || 'Accepting new clients';
    }

    try {
      const res = await fetch('/api/ai/generate-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (res.ok) {
        const data = await res.json();
        setModalSlots(data.slots || []);
        if (data.slots && data.slots.length > 0) {
          setBookingDate(data.slots[0].date);
          if (data.slots[0].timeSlots && data.slots[0].timeSlots.length > 0) {
            setBookingTime(data.slots[0].timeSlots[0]);
          }
        }
      } else {
        throw new Error('Failed to generate slots');
      }
    } catch (e) {
      console.error("Failed to generate slots from AI:", e);
      const fallback = [
        { date: 'Monday, Jun 8', timeSlots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:30 PM'] },
        { date: 'Wednesday, Jun 10', timeSlots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
        { date: 'Friday, Jun 12', timeSlots: ['9:30 AM', '12:00 PM', '3:30 PM'] }
      ];
      setModalSlots(fallback);
      setBookingDate(fallback[0].date);
      setBookingTime(fallback[0].timeSlots[0]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedReq || !bookingDate || !bookingTime) return;
    setBookingInProgress(true);

    const bookingDetails = {
      date: bookingDate,
      timeSlot: bookingTime,
      type: bookingType,
      notes: bookingNotes
    };

    if (isFirebaseMode) {
      try {
        await firestoreHelpers.scheduleReferralAppointment(selectedReq.id, bookingDetails);
        await loadRequests();
        setShowModal(false);
        showToast(`Appointment booked successfully with ${selectedReq.providerName}!`);
      } catch (e) {
        console.error("Booking error:", e);
        showToast("Error booking appointment. Please try again.");
      } finally {
        setBookingInProgress(false);
      }
    } else {
      const allReferrals = storage.getReferrals();
      const updated = allReferrals.map(r => {
        if (r.id === selectedReq.id) {
          return {
            ...r,
            appointmentDate: bookingDate,
            appointmentTimeSlot: bookingTime,
            appointmentType: bookingType,
            appointmentNotes: bookingNotes
          };
        }
        return r;
      });
      storage.setReferrals(updated);
      setSentRequestsList(updated.filter(r => r.name === 'Member (Self)'));
      
      setBookingInProgress(false);
      setShowModal(false);
      showToast(`Appointment booked successfully with ${selectedReq.providerName}!`);
    }
  };

  useEffect(() => {
    async function init() {
      await loadRequests();

      let activePacket: any = null;
      let resolvedProvs: Provider[] = [];

      if (isFirebaseMode && currentUser) {
        try {
          const profile = await firestoreHelpers.getPatientProfile(currentUser.uid);
          if (profile && profile.activeCarePacketId) {
            activePacket = await firestoreHelpers.getCarePacket(profile.activeCarePacketId);
          }
        } catch (e) {
          console.error("Error loading patient packet from Firestore: ", e);
        }
        
        try {
          const { solo, org } = await firestoreHelpers.getAllProviders();
          const dbProvs: Provider[] = [];
          solo.forEach(s => {
            const availability = s.careDetails?.availability || s.availability || '';
            dbProvs.push({
              id: s.userId,
              name: s.profile?.displayName || s.displayName || 'Solo Provider',
              type: 'Solo Clinician',
              licensure: s.licensure 
                ? `${s.licensure.licenseType} (${s.licensure.licenseState})`
                : `${s.licenseType || 'LMFT'} (${s.licenseState || 'California'})`,
              specialty: s.careDetails?.specialties || s.specialties || [],
              modality: s.careDetails?.modalities || s.modalities || ['Telehealth'],
              insurance: s.careDetails?.acceptedCoverageOptions || s.coverageOptions || [],
              slidingScale: s.careDetails?.slidingScaleAvailable || s.coverageOptions?.some(o => o.toLowerCase().includes('sliding')) || false,
              nextAvailable: availability || '1-2 weeks',
              sessionCost: s.careDetails?.selfPayRate || '$120 - $180',
              matchScore: 90,
              matchReason: ''
            });
          });

          org.forEach(o => {
            const availability = o.serviceDetails?.availability || o.availability || '';
            dbProvs.push({
              id: o.orgId,
              name: o.organizationProfile?.organizationName || o.organizationName || 'Clinic Group',
              type: 'Clinic Group',
              licensure: 'Verified Facility',
              specialty: o.serviceDetails?.specialties || o.specialties || [],
              modality: o.serviceDetails?.modalities || o.modalities || ['Telehealth'],
              insurance: o.serviceDetails?.acceptedCoverageOptions || o.coverageOptions || [],
              slidingScale: o.serviceDetails?.slidingScaleAvailable || o.coverageOptions?.some(cov => cov.toLowerCase().includes('sliding')) || false,
              nextAvailable: availability || 'Within a week',
              sessionCost: '$60 - $150',
              matchScore: 90,
              matchReason: ''
            });
          });

          resolvedProvs = dbProvs.length === 0 ? MOCK_PROVIDERS : dbProvs;
        } catch (e) {
          console.error("Error loading providers in request screen: ", e);
          resolvedProvs = MOCK_PROVIDERS;
        }
      } else {
        activePacket = storage.getCarePacket();
        resolvedProvs = MOCK_PROVIDERS;
      }

      setPacket(activePacket);
      setAllProviders(resolvedProvs);

      // Find selected provider
      const pId = providerId || (isFirebaseMode ? '' : storage.getSavedProviders()[0]);
      if (pId) {
        const found = resolvedProvs.find(item => item.id === pId);
        if (found) {
          setProvider(found);
        } else {
          setProvider(resolvedProvs[0] || MOCK_PROVIDERS[0]);
        }
      } else {
        setProvider(resolvedProvs[0] || MOCK_PROVIDERS[0]);
      }
    }

    init();
  }, [providerId, currentUser, isFirebaseMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || !provider || !packet) return;

    setSubmitting(true);
    
    if (isFirebaseMode && currentUser) {
      try {
        await firestoreHelpers.createReferral({
          patientId: currentUser.uid,
          patientDisplayName: currentUser.displayName || 'Patient',
          providerType: provider.type === 'Solo Clinician' ? 'solo_provider' : 'provider_org',
          providerId: provider.id,
          providerName: provider.name,
          carePacketId: packet.packetId || '',
          careRouteId: packet.careRouteId || '',
          status: 'pending',
          createdAt: null,
          updatedAt: null,
        });

        setIsSent(true);
      } catch (e) {
        console.error("Error creating referral: ", e);
      } finally {
        setSubmitting(false);
      }
    } else {
      setTimeout(() => {
        storage.addSentRequest(provider.id);
        const existingReferrals = storage.getReferrals();
        const listToUpdate = existingReferrals.length > 0 ? existingReferrals : [...MOCK_REFERRALS];
        
        const newReferral: Referral = {
          id: `r-${Math.floor(1000 + Math.random() * 9000)}`,
          name: 'Member (Self)',
          route: `Therapy · ${packet.mainConcerns.join(' / ')}`,
          risk: 'low',
          age: 'Adult',
          received: 'Just now',
          insurance: provider.insurance[0] || 'Self-pay',
          summary: packet.shareableSummary,
          status: 'pending',
          providerId: provider.id,
          providerName: provider.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storage.setReferrals([newReferral, ...listToUpdate]);

        setSubmitting(false);
        setIsSent(true);
      }, 1200);
    }
  };

  const handleToggle = (key: string) => {
    setShareToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!hasProviderIdParam) {
    const handleWithdraw = async (id: string) => {
      if (!confirm('Are you sure you want to withdraw this connection request? The provider will no longer see your Care Packet.')) {
        return;
      }
      if (isFirebaseMode) {
        try {
          await firestoreHelpers.deleteReferral(id);
          await loadRequests();
          showToast('Connection request withdrawn.');
        } catch (e) {
          console.error("Error withdrawing referral: ", e);
        }
      } else {
        const allReferrals = storage.getReferrals();
        const updated = allReferrals.filter(r => r.id !== id);
        storage.setReferrals(updated);
        setSentRequestsList(updated.filter(r => r.name === 'Member (Self)'));

        // Also remove providerId from wisecare.sentRequests so they can send it again
        const targetRef = allReferrals.find(r => r.id === id);
        if (targetRef && targetRef.providerId) {
          const savedRequests = storage.getSentRequests();
          const updatedRequests = savedRequests.filter(pid => pid !== targetRef.providerId);
          storage.setStorageItem('wisecare.sentRequests', updatedRequests);
        }

        showToast('Connection request withdrawn.');
      }
    };

    const handleSchedule = (providerName: string) => {
      showToast(`Demo scheduling portal launched for ${providerName}!`);
    };

    return (
      <div className="enter">
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-wise-fg text-wise-surface py-3 px-5 rounded-full shadow-2xl text-xs font-medium z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-wise-teal" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div style={{ marginBottom: '22px' }}>
          <span className="kicker">Connection requests · {sentRequestsList.length} sent</span>
          <h2 className="h2" style={{ margin: '8px 0 4px' }}>Your sent requests.</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px', maxWidth: '60ch' }}>
            Check the status of Care Packets you shared. Providers typically respond within 1–3 business days.
          </p>
        </div>

        {sentRequestsList.length === 0 ? (
          <div className="p-12 text-center bg-wise-surface border border-dashed border-wise-border rounded-2xl flex flex-col items-center gap-4">
            <Info className="w-8 h-8 text-wise-muted shrink-0 mt-0.5" />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '15px', color: 'var(--fg)', marginBottom: '4px' }}>No connection requests sent yet</h4>
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                Save support options first, then review and send your Care Packet from the Matching portal.
              </p>
            </div>
            <Link href="/matching" className="btn btn-primary btn-sm flex items-center gap-1.5 mt-2">
              Find matched support <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        ) : (
          <div className="conn-list">
            {sentRequestsList.map(req => {
              const pName = req.providerName || 'Provider';
              const initials = pName.split(/[ \-\u2014]+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('');
              const status = req.status || 'pending';

              return (
                <div key={req.id} className="flex flex-col w-full">
                  <div className="conn-card">
                    <div className="avatar">{initials}</div>
                    <div>
                      <div className="name">{pName}</div>
                      <div className="meta">
                        {req.route} · Sent {req.received}
                      </div>
                    </div>
                    <div className="status-area">
                      {status === 'accepted' ? (
                        <>
                          <span className="badge success"><span className="dot"></span>ACCEPTED</span>
                          {req.appointmentDate ? (
                            <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-left" style={{ maxWidth: '240px' }}>
                              <div className="text-[11.5px] font-semibold text-emerald-950 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                <span>Intake Scheduled</span>
                              </div>
                              <div className="text-[11px] text-emerald-900 font-medium mt-0.5">{req.appointmentDate} · {req.appointmentTimeSlot}</div>
                              <div className="text-[10px] text-wise-muted italic mt-0.5">{req.appointmentType}</div>
                              {req.appointmentNotes && (
                                <div className="text-[10px] text-wise-muted border-t border-emerald-100/40 pt-1 mt-1 pl-1 border-l border-emerald-300">
                                  "{req.appointmentNotes}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenBookingModal(req)} 
                              className="btn btn-primary btn-xs py-1 px-2.5 text-[11px] font-semibold mt-1"
                            >
                              Schedule appointment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (!isFirebaseMode) {
                                alert("Firebase Mode Required: This secure messaging feature requires an active Firestore database connection.");
                                return;
                              }
                              setActiveChatId(activeChatId === req.id ? null : req.id);
                            }}
                            className={`btn btn-soft btn-xs py-1 px-2.5 text-[11px] font-semibold mt-2 w-full flex items-center justify-center gap-1 ${
                              !isFirebaseMode ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            💬 {activeChatId === req.id ? 'Close Secure Chat' : 'Open Secure Chat'}
                          </button>
                        </>
                      ) : status === 'waitlisted' ? (
                        <>
                          <span className="badge blue"><span className="dot"></span>WAITLISTED</span>
                          <span className="status-msg">Added to waitlist</span>
                          <Link href="/matching" className="btn btn-ghost btn-xs py-1 px-2.5 text-[11px] font-semibold mt-1">
                            Find alternates
                          </Link>
                        </>
                      ) : status === 'declined' ? (
                        <>
                          <span className="badge danger"><span className="dot"></span>DECLINED</span>
                          <span className="status-msg">No current availability</span>
                          <Link href="/matching" className="btn btn-ghost btn-xs py-1 px-2.5 text-[11px] font-semibold mt-1">
                            Find alternates
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="badge warn"><span className="dot"></span>PENDING</span>
                          <span className="status-msg">Replies in 1-3 business days</span>
                          <button onClick={() => handleWithdraw(req.id)} className="btn btn-ghost btn-xs py-1 px-2.5 text-[11px] font-semibold mt-1 text-wise-danger hover:bg-rose-50">
                            Withdraw request
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {activeChatId === req.id && isFirebaseMode && (
                    <div className="mb-4">
                      <PatientChatPanel
                        referralId={req.id}
                        patientId={currentUser?.uid || ''}
                        patientName={currentUser?.displayName || 'Patient'}
                        providerName={pName}
                        onClose={() => setActiveChatId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scheduling Modal */}
        {showModal && selectedReq && (
          <div className="fixed inset-0 bg-wise-fg/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-wise-surface border border-wise-border rounded-3xl max-w-[480px] w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="kicker">Interactive Scheduler</span>
                  <h3 className="h3 mt-1">Schedule Intake Session</h3>
                  <p className="text-xs text-wise-muted mt-0.5">Booking with {selectedReq.providerName}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full bg-wise-surface-2 flex items-center justify-center text-wise-muted hover:text-wise-fg text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-wise-teal border-t-transparent animate-spin"></div>
                  <span className="text-xs text-wise-muted text-center">AI is parsing availability and generating slots...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Date */}
                  <div className="field">
                    <label className="field-label">1. Choose Date</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {modalSlots.map(slot => (
                        <button
                          key={slot.date}
                          type="button"
                          onClick={() => {
                            setBookingDate(slot.date);
                            if (slot.timeSlots && slot.timeSlots.length > 0) {
                              setBookingTime(slot.timeSlots[0]);
                            }
                          }}
                          className={`choice py-2.5 justify-center text-[12.5px] ${bookingDate === slot.date ? 'selected' : ''}`}
                        >
                          {slot.date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  {bookingDate && (
                    <div className="field">
                      <label className="field-label">2. Select Time</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {(modalSlots.find(s => s.date === bookingDate)?.timeSlots || []).map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setBookingTime(time)}
                            className={`choice py-2 justify-center text-[12px] ${bookingTime === time ? 'selected' : ''}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Appointment Type */}
                  <div className="field">
                    <label className="field-label">3. Session Type</label>
                    <select
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="select mt-1"
                    >
                      <option>15-minute consultation</option>
                      <option>Initial intake assessment</option>
                      <option>Standard therapy session</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="field">
                    <label className="field-label">4. Clinical Notes / Intake Context (Optional)</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="textarea mt-1"
                      placeholder="Add any specific context or scheduling notes for your provider here..."
                      style={{ minHeight: '70px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn btn-ghost flex-1 py-2.5 text-xs font-semibold justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={!bookingDate || !bookingTime || bookingInProgress}
                      className="btn btn-primary flex-1 py-2.5 text-xs font-semibold justify-center"
                    >
                      {bookingInProgress ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-wise-teal spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p className="text-sm text-wise-muted">Locating provider details...</p>
      </div>
    );
  }

  const providerInitials = provider.name
    .split(/[ \-\u2014]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0])
    .join('');

  if (isSent) {
    return (
      <div className="confirm-wrap enter">
        <div className="confirm-circle">
          <Check className="w-8 h-8" />
        </div>
        <span className="kicker">Connection request sent</span>
        <h2>Your request is on its way to {provider.name.split(/[ \-\u2014]/)[0].trim()}.</h2>
        <p>
          You'll get a notification when the provider responds, typically within 1-3 business days. 
          In the meantime, we'll keep your dashboard updated.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Back to dashboard<span className="inner icon-only"><ArrowRight className="w-3 h-3" /></span>
          </Link>
          <Link href="/matching" className="btn btn-ghost">
            Save more options
          </Link>
        </div>

        <div className="next-list">
          <h4>What happens next</h4>
          <ul className="b-list">
            <li>
              <span className="num-dot">1</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--fg)' }}>Wait for the provider's response</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Most providers respond within 1–3 business days. You'll get a notification.</span>
              </div>
            </li>
            <li>
              <span className="num-dot">2</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--fg)' }}>If urgency rises, call directly</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>You can reach out by phone if your situation feels more time-sensitive.</span>
              </div>
            </li>
            <li>
              <span className="num-dot">3</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--fg)' }}>Use crisis support if needed</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>If your risk increases, call or text <strong>988</strong>. You don't have to wait.</span>
              </div>
            </li>
            <li>
              <span className="num-dot">4</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--fg)' }}>Check back in a week</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>We'll prompt a follow-up: what worked, what's stuck, what to try next.</span>
              </div>
            </li>
          </ul>
        </div>


      </div>
    );
  }

  // Format dynamic fields for outreach preview based on packet
  const concernsDesc = packet?.mainConcerns?.slice(0, 2).join(' and ') || 'anxiety with sleep difficulty';
  const timelineDesc = packet?.timeline || 'about six weeks';

  return (
    <div className="enter">
      <div style={{ marginBottom: '22px' }}>
        <span className="kicker">Connection request</span>
        <h2 className="h2" style={{ margin: '8px 0 4px' }}>Share your Care Packet with one provider.</h2>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px', maxWidth: '60ch' }}>
          Review what will be shared, give consent, and send. The provider sees only what you choose.
        </p>
      </div>

      <div className="selected-provider">
        <div className="avatar">{providerInitials}</div>
        <div>
          <div className="name">{provider.name}</div>
          <div className="meta">{provider.type} · {provider.licensure} · {provider.modality.join(' · ')}</div>
        </div>
        <Link href="/matching" className="btn btn-ghost btn-sm">Change</Link>
      </div>

      <div className="req-grid">
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div>
            <div className="share-section">
              <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                What will be shared
              </h4>
              
              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Main concerns</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {concernsDesc}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('concerns')} 
                  className={`switch ${shareToggles.concerns ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Timeline</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {timelineDesc}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('timeline')} 
                  className={`switch ${shareToggles.timeline ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Daily impact</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {packet?.dailyLifeImpact?.slice(0, 3).map((i: string) => i.split(':')[0]).join(', ') || 'Sleep, concentration, mood'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('impact')} 
                  className={`switch ${shareToggles.impact ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Care goals</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {packet?.careGoals?.slice(0, 2).join(', ') || 'Sleep consistency, reduce evening worry'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('goals')} 
                  className={`switch ${shareToggles.goals ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Questions to ask</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {packet?.questionsToAskProvider?.length || 4} questions for the first session
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('questions')} 
                  className={`switch ${shareToggles.questions ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Insurance &amp; preferences</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {provider.insurance.slice(0, 2).join(', ')} · {provider.modality.join(', ')}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('insurance')} 
                  className={`switch ${shareToggles.insurance ? '' : 'off'}`}
                ></button>
              </div>

              <div className="share-row">
                <div>
                  <div className="label" style={{ fontWeight: 500, color: 'var(--fg)' }}>Safety check</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    No immediate risk indicators
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggle('safety')} 
                  className={`switch ${shareToggles.safety ? '' : 'off'}`}
                ></button>
              </div>
            </div>

            <div className="share-section">
              <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                Message preview
              </h4>
              <div className="preview-msg">
                <p style={{ marginTop: 0 }}>Hi {provider.name.split(/[ \-\u2014]/)[0].trim()},</p>
                <p>
                  I'm reaching out through Wise Care to ask about starting care for {shareToggles.concerns ? concernsDesc : 'mental health concerns'} 
                  {shareToggles.timeline ? ` which has been ongoing for ${timelineDesc}` : ''}.
                </p>
                {shareToggles.goals && packet?.careGoals && packet.careGoals.length > 0 && (
                  <p>My goals are sleeping more consistently and reducing the intensity of evening worry.</p>
                )}
                {shareToggles.insurance && (
                  <p>
                    I have {provider.insurance.slice(0, 2).join(', ')} or can self-pay. Telehealth or hybrid meeting works best.
                  </p>
                )}
                {shareToggles.safety && (
                  <p>I have no current safety concerns.</p>
                )}
                <p>I've attached a short structured summary prepared with Wise Care. Are you taking new clients in the next two weeks?</p>
                <p style={{ marginBottom: 0 }}>Thank you,<br />Member</p>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info className="w-3.5 h-3.5" /> Preview updates as you adjust what's shared above.
              </div>
            </div>

            <div 
              className={`consent-card ${consent ? 'checked' : ''}`} 
              onClick={() => setConsent(prev => !prev)}
              style={{ cursor: 'pointer' }}
            >
              <div className="box">
                {consent && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <div>
                <h4>I consent to share the items above with this provider.</h4>
                <p>
                  This is the only way the provider sees your information. You can withdraw consent at any time 
                  before the provider opens the request. Wise Care does not share anything else.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/care-packet" className="btn btn-ghost flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to packet</span>
              </Link>
              
              <button 
                type="submit"
                className="btn btn-primary btn-lg" 
                disabled={!consent || submitting} 
                style={!consent ? { opacity: 0.55, cursor: 'not-allowed' } : {}}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>Send connection request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Summary Column */}
        <aside className="summary-pane">
          <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
            Request summary
          </h4>
          <div style={{ fontSize: '13.5px', color: 'var(--fg-soft)', lineHeight: 1.6 }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Items shared</span>
              <strong style={{ color: 'var(--fg)' }}>
                {Object.values(shareToggles).filter(Boolean).length} / 7
              </strong>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Format</span>
              <strong style={{ color: 'var(--fg)' }}>Care Packet</strong>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Provider sees</span>
              <strong style={{ color: 'var(--fg)' }}>Only above</strong>
            </div>
            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>Expected reply</span>
              <strong style={{ color: 'var(--fg)' }}>1–3 days</strong>
            </div>
          </div>

          <div style={{ marginTop: '18px', padding: '14px', background: 'var(--teal-soft)', border: '1px solid oklch(58% 0.085 195 / 0.22)', borderRadius: 'var(--r-md)', fontSize: '12.5px', color: 'oklch(32% 0.07 200)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--teal-deep)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Lock className="w-3.5 h-3.5" /> You stay in control
            </strong>
            You can withdraw the request before the provider opens it. Withdrawn requests are not visible to anyone.
          </div>
        </aside>
      </div>

      <Notice variant="standard" title="Security & Privacy" className="mt-6">
        This is a simulated workspace. Nothing is shared with a provider unless you consent.
      </Notice>
    </div>
  );
}

export default function ConnectionRequestPage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <AppShell title="Connection request" crumbs={['Care', 'Care packet', 'Send request']}>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-wise-teal spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-sm text-wise-muted">Loading connection portal...</p>
          </div>
        }>
          <ConnectionRequestContent />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
