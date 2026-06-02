import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './client';
import { 
  UserRecord, 
  PatientProfile, 
  ProviderOrgProfile, 
  SoloProviderProfile, 
  CareRouteDoc, 
  CarePacketDoc, 
  ReferralDoc, 
  FollowUpDoc, 
  ProviderVerificationDoc,
  ChatMessageDoc,
  SupportPlanDoc
} from './types';

const sortDocsByCreatedAtDesc = <T extends { createdAt: any }>(docs: T[]): T[] => {
  return [...docs].sort((a, b) => {
    const timeA = a.createdAt?.seconds !== undefined
      ? a.createdAt.seconds * 1000 + (a.createdAt.nanoseconds || 0) / 1000000
      : (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime());
    const timeB = b.createdAt?.seconds !== undefined
      ? b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000000
      : (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime());
    return timeB - timeA;
  });
};

export const firestoreHelpers = {
  // --- User Profile helpers ---
  getUserProfile: async (uid: string): Promise<UserRecord | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserRecord) : null;
  },

  setUserProfile: async (uid: string, profile: Partial<UserRecord>): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  getAllUsers: async (): Promise<UserRecord[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(doc => doc.data() as UserRecord);
  },

  updateUserRole: async (uid: string, role: 'patient' | 'provider_org' | 'solo_provider' | 'admin'): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  },

  updateUserDisabled: async (uid: string, disabled: boolean): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await updateDoc(doc(db, 'users', uid), {
      disabled,
      updatedAt: serverTimestamp(),
    });
  },

  deleteUserAccount: async (uid: string, role: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    
    // 1. Delete matching role-specific profile document
    if (role === 'patient') {
      await deleteDoc(doc(db, 'patients', uid));
    } else if (role === 'solo_provider') {
      await deleteDoc(doc(db, 'soloProviders', uid));
    } else if (role === 'provider_org') {
      await deleteDoc(doc(db, 'providerOrganizations', uid));
    }

    // 2. Delete the primary users record
    await deleteDoc(doc(db, 'users', uid));
  },

  // --- Patient Profile helpers ---
  getPatientProfile: async (uid: string): Promise<PatientProfile | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'patients', uid));
    return snap.exists() ? (snap.data() as PatientProfile) : null;
  },

  setPatientProfile: async (uid: string, profile: Partial<PatientProfile>): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'patients', uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // --- Solo Provider helpers ---
  getSoloProviderProfile: async (uid: string): Promise<SoloProviderProfile | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'soloProviders', uid));
    return snap.exists() ? parseSoloProviderProfile(snap.data()) : null;
  },

  setSoloProviderProfile: async (uid: string, profile: Partial<SoloProviderProfile>): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'soloProviders', uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // --- Provider Organization helpers ---
  getProviderOrgProfile: async (orgId: string): Promise<ProviderOrgProfile | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'providerOrganizations', orgId));
    return snap.exists() ? parseProviderOrgProfile(snap.data()) : null;
  },

  setProviderOrgProfile: async (orgId: string, profile: Partial<ProviderOrgProfile>): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'providerOrganizations', orgId), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // --- Care Route helpers ---
  getCareRoute: async (routeId: string): Promise<CareRouteDoc | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'careRoutes', routeId));
    return snap.exists() ? { routeId: snap.id, ...snap.data() } as CareRouteDoc : null;
  },

  createCareRoute: async (route: Omit<CareRouteDoc, 'routeId'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    const ref = await addDoc(collection(db, 'careRoutes'), {
      ...route,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  // --- Care Packet helpers ---
  getCarePacket: async (packetId: string): Promise<CarePacketDoc | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'carePackets', packetId));
    return snap.exists() ? { packetId: snap.id, ...snap.data() } as CarePacketDoc : null;
  },

  createCarePacket: async (packet: Omit<CarePacketDoc, 'packetId'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    const ref = await addDoc(collection(db, 'carePackets'), {
      ...packet,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  // --- Referral helpers ---
  getReferralsForPatient: async (patientId: string): Promise<ReferralDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const q = query(
      collection(db, 'referrals'),
      where('patientId', '==', patientId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ referralId: doc.id, ...doc.data() } as ReferralDoc));
    return sortDocsByCreatedAtDesc(results);
  },

  getReferralsForProvider: async (providerId: string): Promise<ReferralDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const q = query(
      collection(db, 'referrals'),
      where('providerId', '==', providerId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ referralId: doc.id, ...doc.data() } as ReferralDoc));
    return sortDocsByCreatedAtDesc(results);
  },

  createReferral: async (referral: Omit<ReferralDoc, 'referralId'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    const ref = await addDoc(collection(db, 'referrals'), {
      ...referral,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  updateReferralStatus: async (
    referralId: string, 
    status: ReferralDoc['status'], 
    providerMessage?: string
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    const updateData: Partial<ReferralDoc> = {
      status,
      updatedAt: serverTimestamp()
    };
    if (providerMessage !== undefined) {
      updateData.providerMessage = providerMessage;
    }
    await updateDoc(doc(db, 'referrals', referralId), updateData);

    if (status === 'accepted') {
      try {
        const snap = await getDoc(doc(db, 'referrals', referralId));
        if (snap.exists()) {
          const refData = snap.data() as ReferralDoc;
          await firestoreHelpers.seedDemoChatMessages(
            referralId,
            refData.patientId,
            refData.patientDisplayName,
            refData.providerId,
            refData.providerName
          );
        }
      } catch (err) {
        console.error("Error auto-seeding chat messages upon acceptance:", err);
      }
    }
  },

  sendChatMessage: async (referralId: string, senderId: string, senderName: string, text: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    const msgRef = collection(db, 'referrals', referralId, 'messages');
    await addDoc(msgRef, {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp()
    });
  },

  subscribeChatMessages: (referralId: string, callback: (messages: ChatMessageDoc[]) => void): (() => void) => {
    if (!isFirebaseConfigured || !db) return () => {};
    const msgRef = collection(db, 'referrals', referralId, 'messages');
    const q = query(msgRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          messageId: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt
        } as ChatMessageDoc;
      });
      callback(messages);
    }, (error) => {
      console.error("Error listening to chat messages:", error);
    });
  },

  seedDemoChatMessages: async (
    referralId: string,
    patientId: string,
    patientName: string,
    providerId: string,
    providerName: string
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    const msgRef = collection(db, 'referrals', referralId, 'messages');
    const existing = await getDocs(msgRef);
    if (!existing.empty) return; // Already seeded

    // 1. Patient outreach
    await addDoc(msgRef, {
      senderId: patientId,
      senderName: patientName || 'Patient',
      text: "I'm looking to start weekly therapy for anxiety and sleep difficulty. I have prepared and shared my Care Packet. Please let me know if you are taking new clients and if we can schedule a consultation.",
      createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
    });

    // 2. Provider welcome
    await addDoc(msgRef, {
      senderId: providerId,
      senderName: providerName || 'Provider',
      text: `Hello ${patientName || 'there'}! Thank you for sharing your Care Packet. I have reviewed your goals and concerns regarding anxiety and sleep support. I would be happy to discuss how we can work together. Let's schedule a 15-minute consultation.`,
      createdAt: new Date(Date.now() - 3600000 * 1.8) // 1.8 hours ago
    });

    // 3. Patient reply
    await addDoc(msgRef, {
      senderId: patientId,
      senderName: patientName || 'Patient',
      text: "Thank you for the quick response! I'll look at your available times and pick a slot that works.",
      createdAt: new Date(Date.now() - 3600000 * 1.5) // 1.5 hours ago
    });
  },

  scheduleReferralAppointment: async (
    referralId: string,
    appointmentDetails: {
      date: string;
      timeSlot: string;
      type: string;
      notes?: string;
    }
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    await updateDoc(doc(db, 'referrals', referralId), {
      appointmentDate: appointmentDetails.date,
      appointmentTimeSlot: appointmentDetails.timeSlot,
      appointmentType: appointmentDetails.type,
      appointmentNotes: appointmentDetails.notes || '',
      updatedAt: serverTimestamp()
    });
  },

  deleteReferral: async (referralId: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    // For local database safety or withdraw requests, we soft-delete by setting status to withdrawn
    await updateDoc(doc(db, 'referrals', referralId), {
      status: 'withdrawn',
      updatedAt: serverTimestamp()
    });
  },

  // --- Support Plans helpers ---
  getSupportPlan: async (planId: string): Promise<SupportPlanDoc | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const snap = await getDoc(doc(db, 'supportPlans', planId));
    return snap.exists() ? { planId: snap.id, ...snap.data() } as SupportPlanDoc : null;
  },

  getSupportPlanForReferral: async (referralId: string): Promise<SupportPlanDoc | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const q = query(
      collection(db, 'supportPlans'),
      where('referralId', '==', referralId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const firstDoc = snap.docs[0];
    return { planId: firstDoc.id, ...firstDoc.data() } as SupportPlanDoc;
  },

  getSupportPlanForPatient: async (patientId: string): Promise<SupportPlanDoc | null> => {
    if (!isFirebaseConfigured || !db) return null;
    const q = query(
      collection(db, 'supportPlans'),
      where('patientId', '==', patientId),
      where('status', '==', 'shared')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const list = snap.docs.map(doc => ({ planId: doc.id, ...doc.data() } as SupportPlanDoc));
    const sorted = list.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    return sorted[0];
  },

  getSupportPlansForProvider: async (providerId: string): Promise<SupportPlanDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const q = query(
      collection(db, 'supportPlans'),
      where('providerId', '==', providerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ planId: doc.id, ...doc.data() } as SupportPlanDoc));
  },

  createOrUpdateSupportPlan: async (
    planId: string | null,
    planData: Partial<SupportPlanDoc>
  ): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    
    const cleaningData = {
      ...planData,
      updatedAt: serverTimestamp(),
    };

    if (planData.status === 'shared' && !planData.sharedAt) {
      cleaningData.sharedAt = serverTimestamp();
    }

    if (planId) {
      await setDoc(doc(db, 'supportPlans', planId), cleaningData, { merge: true });
      return planId;
    } else {
      const ref = await addDoc(collection(db, 'supportPlans'), {
        ...cleaningData,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    }
  },

  updateTaskCompletion: async (
    planId: string,
    taskId: string,
    completed: boolean,
    patientNote?: string
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    const planRef = doc(db, 'supportPlans', planId);
    const snap = await getDoc(planRef);
    if (!snap.exists()) return;
    
    const data = snap.data() as SupportPlanDoc;
    const updatedTasks = data.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
          patientNote: patientNote !== undefined ? patientNote : t.patientNote
        };
      }
      return t;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const totalCount = updatedTasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const progressSummary = `${completedCount} of ${totalCount} tasks completed (${percent}%)`;

    await updateDoc(planRef, {
      tasks: updatedTasks,
      patientProgressSummary: progressSummary,
      updatedAt: serverTimestamp()
    });
  },

  // --- Follow Up helpers ---
  createFollowUp: async (followUp: Omit<FollowUpDoc, 'followUpId'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    const ref = await addDoc(collection(db, 'followUps'), {
      ...followUp,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  getFollowUpsForPatient: async (patientId: string): Promise<FollowUpDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const q = query(
      collection(db, 'followUps'),
      where('patientId', '==', patientId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ followUpId: doc.id, ...doc.data() } as FollowUpDoc));
    return sortDocsByCreatedAtDesc(results);
  },

  // --- Admin/Verification helpers ---
  createVerificationRequest: async (request: Omit<ProviderVerificationDoc, 'requestId'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) return '';
    const ref = await addDoc(collection(db, 'providerVerificationRequests'), {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  getVerificationRequests: async (): Promise<ProviderVerificationDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    
    // Fetch all providers
    const { solo, org } = await firestoreHelpers.getAllProviders();
    const requests: ProviderVerificationDoc[] = [];

    // Filter pending solo providers
    solo.forEach(s => {
      const vStatus = s.verification?.verificationStatus || s.verificationStatus || 'draft';
      if (vStatus === 'pending') {
        requests.push({
          requestId: s.userId,
          providerType: 'solo_provider',
          providerId: s.userId,
          submittedBy: s.profile?.contactEmail || 'unknown',
          status: 'pending',
          notes: s.verification?.adminNotes || '',
          createdAt: s.verification?.submittedAt || s.createdAt || null,
          updatedAt: s.verification?.reviewedAt || s.updatedAt || null,
        });
      }
    });

    // Filter pending org providers
    org.forEach(o => {
      const vStatus = o.verification?.verificationStatus || o.verificationStatus || 'draft';
      if (vStatus === 'pending') {
        requests.push({
          requestId: o.orgId,
          providerType: 'provider_org',
          providerId: o.orgId,
          submittedBy: o.organizationProfile?.primaryContactEmail || 'unknown',
          status: 'pending',
          notes: o.verification?.adminNotes || '',
          createdAt: o.verification?.submittedAt || o.createdAt || null,
          updatedAt: o.verification?.reviewedAt || o.updatedAt || null,
        });
      }
    });

    return requests;
  },

  updateVerificationRequestStatus: async (
    requestId: string, 
    status: ProviderVerificationDoc['status'],
    notes: string,
    providerType: 'solo_provider' | 'provider_org',
    providerId: string
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    
    // Map status strings to verificationStatus
    const mappedStatus = status === 'approved' 
      ? 'verified' 
      : status === 'rejected' 
        ? 'rejected' 
        : status === 'request_info' 
          ? 'request_info' 
          : 'pending';

    const colName = providerType === 'solo_provider' ? 'soloProviders' : 'providerOrganizations';
    await updateDoc(doc(db, colName, providerId), {
      'verification.verificationStatus': mappedStatus,
      'verification.adminNotes': notes,
      'verification.reviewedAt': serverTimestamp(),
      'verificationStatus': mappedStatus,
      'updatedAt': serverTimestamp()
    });
  },

  updateProviderVerificationStatus: async (
    providerId: string,
    providerType: 'solo_provider' | 'provider_org',
    status: 'draft' | 'pending' | 'verified' | 'rejected' | 'request_info',
    adminNotes: string,
    itemStatuses: Record<string, 'pending' | 'verified' | 'needs_info' | 'rejected'>,
    itemNotes: Record<string, string>
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    const colName = providerType === 'solo_provider' ? 'soloProviders' : 'providerOrganizations';
    
    await updateDoc(doc(db, colName, providerId), {
      'verification.verificationStatus': status,
      'verification.adminNotes': adminNotes,
      'verification.itemStatuses': itemStatuses,
      'verification.itemNotes': itemNotes,
      'verification.reviewedAt': serverTimestamp(),
      'verificationStatus': status,
      'updatedAt': serverTimestamp()
    });
  },

  // --- Directory Match Seeder ---
  getAllProviders: async (): Promise<{ solo: SoloProviderProfile[], org: ProviderOrgProfile[] }> => {
    if (!isFirebaseConfigured || !db) return { solo: [], org: [] };
    
    const soloSnap = await getDocs(collection(db, 'soloProviders'));
    const orgSnap = await getDocs(collection(db, 'providerOrganizations'));

    return {
      solo: soloSnap.docs.map(d => parseSoloProviderProfile(d.data())),
      org: orgSnap.docs.map(d => parseProviderOrgProfile(d.data())),
    };
  },

  seedDemoProviders: async (): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;

    // 1. seed_solo_verified_01
    await setDoc(doc(db, 'soloProviders', 'seed_solo_verified_01'), {
      userId: 'seed_solo_verified_01',
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
        licenseDocument: null,
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
        reference2Status: 'received',
      },
      verification: {
        verificationStatus: 'verified',
        adminNotes: 'All credentials checked and verified with the California Board of Psychology.',
        itemStatuses: {
          identity: 'verified',
          license: 'verified',
          state: 'verified',
          expiration: 'verified',
          specialties: 'verified',
          modalities: 'verified',
          coverage: 'verified',
          references: 'verified',
        },
        itemNotes: {
          license: 'Matched state database entry.',
        },
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. seed_solo_pending_01
    await setDoc(doc(db, 'soloProviders', 'seed_solo_pending_01'), {
      userId: 'seed_solo_pending_01',
      profile: {
        displayName: 'Jordan Vance, LCSW',
        providerTitle: 'Licensed Clinical Social Worker',
        bio: 'Focusing on adolescent stress, trauma recovery, and LGBTQ+ supportive spaces.',
        profilePhoto: null,
        contactEmail: 'jordan.vance@example.com',
        contactPhone: '555-0102',
      },
      licensure: {
        licenseType: 'LCSW',
        licenseNumberPlaceholder: 'LCSW88273',
        licenseState: 'Washington',
        licenseExpirationDate: '2027-04-15',
        licenseDocument: null,
        telehealthStates: ['Washington'],
      },
      careDetails: {
        specialties: ['Trauma', 'Burnout', 'Work stress'],
        modalities: ['Telehealth'],
        acceptedCoverageOptions: ['United', 'Cigna', 'Self-pay'],
        selfPayRate: '$130',
        slidingScaleAvailable: true,
        languages: ['English'],
        availability: 'Weekday evenings · 5-8pm',
      },
      references: {
        reference1Name: 'Emily Dickinson',
        reference1Relationship: 'Former Manager',
        reference1Email: 'emily.d@healthwash.org',
        reference1Status: 'received',
        reference2Name: 'Walt Whitman',
        reference2Relationship: 'Colleague',
        reference2Email: 'walt.w@counseling.net',
        reference2Status: 'requested',
      },
      verification: {
        verificationStatus: 'pending',
        adminNotes: 'Awaiting reference responses.',
        itemStatuses: {
          identity: 'verified',
          license: 'pending',
          references: 'pending',
        },
        itemNotes: {},
        submittedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 3. seed_solo_request_info_01
    await setDoc(doc(db, 'soloProviders', 'seed_solo_request_info_01'), {
      userId: 'seed_solo_request_info_01',
      profile: {
        displayName: 'Terry Loomis, LMFT',
        providerTitle: 'Marriage & Family Therapist',
        bio: 'Supporting couples through conflict, transition, and communication barriers.',
        profilePhoto: null,
        contactEmail: 'terry.loomis@example.com',
        contactPhone: '555-0103',
      },
      licensure: {
        licenseType: 'LMFT',
        licenseNumberPlaceholder: 'MFT77661',
        licenseState: 'Oregon',
        licenseExpirationDate: '2026-11-01',
        licenseDocument: null,
        telehealthStates: ['Oregon'],
      },
      careDetails: {
        specialties: ['Relationships', 'Anxiety'],
        modalities: ['In-person'],
        acceptedCoverageOptions: ['Marketplace Plan', 'Self-pay'],
        selfPayRate: '$140',
        slidingScaleAvailable: false,
        languages: ['English'],
        availability: 'Saturdays · 9am-3pm',
      },
      references: {
        reference1Name: 'Alice Walker',
        reference1Relationship: 'Supervisor',
        reference1Email: 'alice.w@cascadetherapy.com',
        reference1Status: 'received',
        reference2Name: 'James Baldwin',
        reference2Relationship: 'Professional Peer',
        reference2Email: 'james.b@oregonmft.org',
        reference2Status: 'not_sent',
      },
      verification: {
        verificationStatus: 'request_info',
        adminNotes: 'Expired license listed in application documents.',
        itemStatuses: {
          identity: 'verified',
          license: 'rejected',
          expiration: 'needs_info',
          references: 'needs_info',
        },
        itemNotes: {
          license: 'Document provided appears to have expired last year. Please upload a scan of your current active Oregon license card.',
          references: 'Need second reference email.',
        },
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 4. seed_org_verified_01
    await setDoc(doc(db, 'providerOrganizations', 'seed_org_verified_01'), {
      orgId: 'seed_org_verified_01',
      ownerUserId: 'seed_org_verified_01',
      organizationProfile: {
        organizationName: 'Clearwater Behavioral Health',
        organizationType: 'group_practice',
        organizationBio: 'A comprehensive multidisciplinary clinic offering psychiatric care, social work, and group therapy.',
        logo: null,
        primaryContactName: 'Dr. Raymond H. Vance',
        primaryContactEmail: 'r.vance@clearwaterbehavioral.com',
        primaryContactPhone: '555-0201',
        website: 'https://clearwaterbehavioral.com',
      },
      credentialInfo: {
        businessLicensePlaceholder: 'BUS-CBH-9921',
        licenseState: 'California',
        accreditationPlaceholder: 'CARF International Accredited',
        credentialDocument: null,
      },
      serviceDetails: {
        servicesOffered: ['Psychological assessment', 'Medication management', 'Group circle therapy'],
        specialties: ['Anxiety', 'Depression', 'Trauma', 'Sleep'],
        modalities: ['Telehealth', 'In-person'],
        locations: ['California'],
        acceptedCoverageOptions: ['BCBS', 'United', 'Aetna', 'Public Coverage', 'Sliding scale'],
        slidingScaleAvailable: true,
        availability: 'Mon-Fri · 8am - 6pm',
        clinicianCount: 12,
      },
      references: {
        reference1Name: 'CARF Inspector Division',
        reference1Relationship: 'Accreditation body',
        reference1Email: 'verify@carf.org',
        reference1Status: 'received',
        reference2Name: 'County Health Department',
        reference2Relationship: 'Licensing liaison',
        reference2Email: 'contact@countyhealth.ca.gov',
        reference2Status: 'received',
      },
      verification: {
        verificationStatus: 'verified',
        adminNotes: 'CARF accreditation active. California business registration verified.',
        itemStatuses: {
          identity: 'verified',
          business: 'verified',
          accreditation: 'verified',
          references: 'verified',
        },
        itemNotes: {},
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 5. seed_org_pending_01
    await setDoc(doc(db, 'providerOrganizations', 'seed_org_pending_01'), {
      orgId: 'seed_org_pending_01',
      ownerUserId: 'seed_org_pending_01',
      organizationProfile: {
        organizationName: 'Summit Recovery & Counseling',
        organizationType: 'community_clinic',
        organizationBio: 'Community mental health clinic focusing on crisis support, outpatient counseling, and recovery programs.',
        logo: null,
        primaryContactName: 'Alex Sterling',
        primaryContactEmail: 'a.sterling@summitcommunity.org',
        primaryContactPhone: '555-0202',
        website: 'https://summitcommunity.org',
      },
      credentialInfo: {
        businessLicensePlaceholder: 'BUS-SUMMIT-8802',
        licenseState: 'Washington',
        accreditationPlaceholder: 'State Certified Outpatient Facility',
        credentialDocument: null,
      },
      serviceDetails: {
        servicesOffered: ['Outpatient recovery', 'Family support circles', 'Peer advocacy'],
        specialties: ['Trauma', 'Relationships'],
        modalities: ['In-person'],
        locations: ['Washington'],
        acceptedCoverageOptions: ['Public Coverage', 'Free', 'Sliding scale'],
        slidingScaleAvailable: true,
        availability: 'Weekdays · 9am - 5pm',
        clinicianCount: 4,
      },
      references: {
        reference1Name: 'King County Health Bureau',
        reference1Relationship: 'Funding Auditor',
        reference1Email: 'verify@kingcounty.gov',
        reference1Status: 'requested',
        reference2Name: 'Summit Community Trustees',
        reference2Relationship: 'Advisory Board Chair',
        reference2Email: 'trustee@summitcommunity.org',
        reference2Status: 'requested',
      },
      verification: {
        verificationStatus: 'pending',
        adminNotes: 'Initial submission. Washington State facility license pending board confirmation.',
        itemStatuses: {
          identity: 'verified',
          business: 'pending',
        },
        itemNotes: {},
        submittedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
};

// --- Parsers to ensure backward compatibility with flat profiles ---

export function parseSoloProviderProfile(data: any): SoloProviderProfile {
  if (!data) return data;
  
  const nestedExist = data.profile || data.licensure || data.careDetails || data.references || data.verification;
  if (nestedExist) {
    return {
      userId: data.userId || '',
      profile: data.profile || {
        displayName: data.displayName || '',
        providerTitle: '',
        bio: '',
        profilePhoto: null,
        contactEmail: '',
        contactPhone: '',
      },
      licensure: data.licensure || {
        licenseType: data.licenseType || '',
        licenseNumberPlaceholder: data.licenseNumberPlaceholder || '',
        licenseState: data.licenseState || '',
        licenseExpirationDate: '',
        licenseDocument: null,
        telehealthStates: [],
      },
      careDetails: data.careDetails || {
        specialties: data.specialties || [],
        modalities: data.modalities || [],
        acceptedCoverageOptions: data.coverageOptions || [],
        selfPayRate: '',
        slidingScaleAvailable: false,
        languages: [],
        availability: data.availability || '',
      },
      references: data.references || {
        reference1Name: '',
        reference1Relationship: '',
        reference1Email: '',
        reference1Status: 'not_sent',
        reference2Name: '',
        reference2Relationship: '',
        reference2Email: '',
        reference2Status: 'not_sent',
      },
      verification: data.verification || {
        verificationStatus: data.verificationStatus || 'draft',
        adminNotes: '',
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      displayName: data.displayName || data.profile?.displayName,
      licenseType: data.licenseType || data.licensure?.licenseType,
      licenseState: data.licenseState || data.licensure?.licenseState,
      licenseNumberPlaceholder: data.licenseNumberPlaceholder || data.licensure?.licenseNumberPlaceholder,
      specialties: data.specialties || data.careDetails?.specialties,
      modalities: data.modalities || data.careDetails?.modalities,
      coverageOptions: data.coverageOptions || data.careDetails?.acceptedCoverageOptions,
      availability: data.availability || data.careDetails?.availability,
      verificationStatus: data.verification?.verificationStatus || data.verificationStatus || 'draft',
    };
  }

  // Map flat to nested
  return {
    userId: data.userId || '',
    profile: {
      displayName: data.displayName || '',
      providerTitle: data.licenseType || 'LMFT',
      bio: 'Professional mental health clinician.',
      profilePhoto: null,
      contactEmail: '',
      contactPhone: '',
    },
    licensure: {
      licenseType: data.licenseType || 'LMFT',
      licenseNumberPlaceholder: data.licenseNumberPlaceholder || '',
      licenseState: data.licenseState || 'California',
      licenseExpirationDate: '2028-12-31',
      licenseDocument: null,
      npiPlaceholder: '',
      telehealthStates: [data.licenseState || 'California'],
    },
    careDetails: {
      specialties: data.specialties || [],
      modalities: data.modalities || [],
      acceptedCoverageOptions: data.coverageOptions || [],
      selfPayRate: '$150',
      slidingScaleAvailable: data.coverageOptions?.some((o: string) => o.toLowerCase().includes('sliding')) || false,
      languages: ['English'],
      availability: data.availability || 'Accepting new clients',
    },
    references: {
      reference1Name: 'Dr. Jane Smith',
      reference1Relationship: 'Supervisor',
      reference1Email: 'jane.smith@example.com',
      reference1Status: 'received',
      reference2Name: 'Robert Johnson',
      reference2Relationship: 'Colleague',
      reference2Email: 'robert.j@example.com',
      reference2Status: 'received',
    },
    verification: {
      verificationStatus: data.verificationStatus || 'draft',
      adminNotes: '',
      itemStatuses: {},
      itemNotes: {},
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    displayName: data.displayName,
    licenseType: data.licenseType,
    licenseState: data.licenseState,
    licenseNumberPlaceholder: data.licenseNumberPlaceholder,
    specialties: data.specialties,
    modalities: data.modalities,
    coverageOptions: data.coverageOptions,
    availability: data.availability,
    verificationStatus: data.verificationStatus,
  };
}

export function parseProviderOrgProfile(data: any): ProviderOrgProfile {
  if (!data) return data;
  
  const nestedExist = data.organizationProfile || data.credentialInfo || data.serviceDetails || data.references || data.verification;
  if (nestedExist) {
    return {
      orgId: data.orgId || '',
      ownerUserId: data.ownerUserId || '',
      organizationProfile: data.organizationProfile || {
        organizationName: data.organizationName || '',
        organizationType: data.organizationType || 'group_practice',
        organizationBio: '',
        logo: null,
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
      },
      credentialInfo: data.credentialInfo || {
        businessLicensePlaceholder: '',
        licenseState: '',
        credentialDocument: null,
      },
      serviceDetails: data.serviceDetails || {
        servicesOffered: data.services || [],
        specialties: data.specialties || [],
        modalities: data.modalities || [],
        locations: data.locations || [],
        acceptedCoverageOptions: data.coverageOptions || [],
        slidingScaleAvailable: false,
        availability: data.availability || '',
        clinicianCount: 1,
      },
      references: data.references || {
        reference1Name: '',
        reference1Relationship: '',
        reference1Email: '',
        reference1Status: 'not_sent',
        reference2Name: '',
        reference2Relationship: '',
        reference2Email: '',
        reference2Status: 'not_sent',
      },
      verification: data.verification || {
        verificationStatus: data.verificationStatus || 'draft',
        adminNotes: '',
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      organizationName: data.organizationName || data.organizationProfile?.organizationName,
      organizationType: data.organizationType || data.organizationProfile?.organizationType,
      verificationStatus: data.verification?.verificationStatus || data.verificationStatus || 'draft',
      services: data.services || data.serviceDetails?.servicesOffered,
      specialties: data.specialties || data.serviceDetails?.specialties,
      modalities: data.modalities || data.serviceDetails?.modalities,
      coverageOptions: data.coverageOptions || data.serviceDetails?.acceptedCoverageOptions,
      locations: data.locations || data.serviceDetails?.locations,
      availability: data.availability || data.serviceDetails?.availability,
    };
  }

  // Map flat to nested
  return {
    orgId: data.orgId || '',
    ownerUserId: data.ownerUserId || '',
    organizationProfile: {
      organizationName: data.organizationName || 'Quietford Collective',
      organizationType: data.organizationType || 'group_practice',
      organizationBio: 'Professional mental health services group.',
      logo: null,
      primaryContactName: 'Jane Smith',
      primaryContactEmail: 'contact@quietford.com',
      primaryContactPhone: '555-0192',
      website: '',
    },
    credentialInfo: {
      businessLicensePlaceholder: 'BUS-99881',
      licenseState: data.locations?.[0] || 'California',
      accreditationPlaceholder: '',
      credentialDocument: null,
    },
    serviceDetails: {
      servicesOffered: data.services || [],
      specialties: data.specialties || [],
      modalities: data.modalities || [],
      locations: data.locations || [],
      acceptedCoverageOptions: data.coverageOptions || [],
      slidingScaleAvailable: data.coverageOptions?.some((o: string) => o.toLowerCase().includes('sliding')) || false,
      availability: data.availability || 'Accepting new clients',
      clinicianCount: 5,
    },
    references: {
      reference1Name: 'State Health Board Representative',
      reference1Relationship: 'Credential Auditor',
      reference1Email: 'auditor@statehealth.org',
      reference1Status: 'received',
      reference2Name: 'County Clinic Association',
      reference2Relationship: 'Association Liaison',
      reference2Email: 'liaison@countyclinics.org',
      reference2Status: 'received',
    },
    verification: {
      verificationStatus: data.verificationStatus || 'draft',
      adminNotes: '',
      itemStatuses: {},
      itemNotes: {},
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    organizationName: data.organizationName,
    organizationType: data.organizationType,
    verificationStatus: data.verificationStatus,
    services: data.services,
    specialties: data.specialties,
    modalities: data.modalities,
    coverageOptions: data.coverageOptions,
    locations: data.locations,
    availability: data.availability,
  };
}

