export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient' | 'provider_org' | 'solo_provider' | 'admin';
  onboardingComplete: boolean;
  disabled?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface PatientProfile {
  userId: string;
  displayName: string;
  intakeStatus: 'not_started' | 'started' | 'completed';
  activeCareRouteId: string | null;
  activeCarePacketId: string | null;
  activeReferralId: string | null;
  intakeAnswers?: any;
  savedProviderIds?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface ProviderOrgProfile {
  orgId: string;
  ownerUserId: string;
  organizationName: string;
  organizationType: 'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org';
  verificationStatus: 'draft' | 'pending' | 'verified' | 'rejected';
  services: string[];
  specialties: string[];
  modalities: string[];
  coverageOptions: string[];
  locations: string[];
  availability: string;
  createdAt: any;
  updatedAt: any;
}

export interface SoloProviderProfile {
  userId: string;
  displayName: string;
  licenseType: string;
  licenseState: string;
  licenseNumberPlaceholder: string;
  specialties: string[];
  modalities: string[];
  coverageOptions: string[];
  availability: string;
  verificationStatus: 'draft' | 'pending' | 'verified' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export interface CareRouteDoc {
  routeId?: string;
  patientId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'crisis';
  recommendedRoute: string;
  recommendedSupportTypes: string[];
  reasoningSummary: string;
  detectedBarriers: string[];
  careGoals: string[];
  nextSteps: string[];
  matchingCriteria: {
    supportTypes: string[];
    modality: string;
    paymentPreference: string;
    urgency: string;
    state: string;
  };
  safetyMessage: string;
  isFallback: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CarePacketDoc {
  packetId?: string;
  patientId: string;
  careRouteId: string;
  mainConcerns: string[];
  timeline: string;
  dailyLifeImpact: string[];
  careGoals: string[];
  questionsToAskProvider: string[];
  materialsToPrepare: string[];
  insurancePaymentNotes: string[];
  suggestedOutreachMessage: string;
  shareableSummary: string;
  nextStepChecklist: string[];
  selectedFields: Record<string, boolean>;
  isFallback?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ReferralDoc {
  referralId?: string;
  patientId: string;
  patientDisplayName: string;
  providerType: 'provider_org' | 'solo_provider';
  providerId: string;
  providerName: string;
  carePacketId: string;
  careRouteId: string;
  status: 'pending' | 'accepted' | 'waitlisted' | 'declined' | 'request_info' | 'withdrawn';
  providerMessage?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FollowUpDoc {
  followUpId?: string;
  patientId: string;
  referralId: string;
  contactedProvider: boolean;
  scheduledAppointment: boolean;
  blocker: string;
  recommendedAdjustment: string;
  nextBestActions: string[];
  createdAt: any;
}

export interface ProviderVerificationDoc {
  requestId?: string;
  providerType: 'provider_org' | 'solo_provider';
  providerId: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'request_info';
  notes: string;
  createdAt: any;
  updatedAt: any;
}
