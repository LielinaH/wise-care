import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc,
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
  ProviderVerificationDoc 
} from './types';

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
    return snap.exists() ? (snap.data() as SoloProviderProfile) : null;
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
    return snap.exists() ? (snap.data() as ProviderOrgProfile) : null;
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
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ referralId: doc.id, ...doc.data() } as ReferralDoc));
  },

  getReferralsForProvider: async (providerId: string): Promise<ReferralDoc[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const q = query(
      collection(db, 'referrals'),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ referralId: doc.id, ...doc.data() } as ReferralDoc));
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
  },

  deleteReferral: async (referralId: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    // For local database safety or withdraw requests, we soft-delete by setting status to withdrawn
    await updateDoc(doc(db, 'referrals', referralId), {
      status: 'withdrawn',
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
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ followUpId: doc.id, ...doc.data() } as FollowUpDoc));
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
    const q = query(
      collection(db, 'providerVerificationRequests'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as ProviderVerificationDoc));
  },

  updateVerificationRequestStatus: async (
    requestId: string, 
    status: ProviderVerificationDoc['status'],
    notes: string,
    providerType: 'solo_provider' | 'provider_org',
    providerId: string
  ): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;
    // 1. Update verification request status
    await updateDoc(doc(db, 'providerVerificationRequests', requestId), {
      status,
      notes,
      updatedAt: serverTimestamp()
    });

    // 2. Map request status to provider profile verificationStatus
    const mappedStatus = status === 'approved' 
      ? 'verified' 
      : status === 'rejected' 
        ? 'rejected' 
        : status === 'request_info' 
          ? 'pending' 
          : 'pending';

    const colName = providerType === 'solo_provider' ? 'soloProviders' : 'providerOrganizations';
    await updateDoc(doc(db, colName, providerId), {
      verificationStatus: mappedStatus,
      updatedAt: serverTimestamp()
    });
  },

  // --- Directory Match Seeder ---
  getAllProviders: async (): Promise<{ solo: SoloProviderProfile[], org: ProviderOrgProfile[] }> => {
    if (!isFirebaseConfigured || !db) return { solo: [], org: [] };
    
    const soloSnap = await getDocs(collection(db, 'soloProviders'));
    const orgSnap = await getDocs(collection(db, 'providerOrganizations'));

    return {
      solo: soloSnap.docs.map(d => d.data() as SoloProviderProfile),
      org: orgSnap.docs.map(d => d.data() as ProviderOrgProfile),
    };
  }
};
