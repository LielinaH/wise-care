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

export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  demoOnly: boolean;
  storagePath: string | null;
  downloadURL: string | null;
}

export interface VerificationInfo {
  verificationStatus: 'draft' | 'pending' | 'verified' | 'rejected' | 'request_info';
  submittedAt?: any;
  reviewedAt?: any;
  adminNotes?: string;
  itemStatuses?: Record<string, 'pending' | 'verified' | 'needs_info' | 'rejected'>;
  itemNotes?: Record<string, string>;
}

export interface ProviderOrgProfile {
  orgId: string;
  ownerUserId: string;
  organizationProfile?: {
    organizationName: string;
    organizationType: 'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org';
    organizationBio: string;
    logo: FileMetadata | null;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    website?: string;
  };
  credentialInfo?: {
    businessLicensePlaceholder: string;
    licenseState: string;
    accreditationPlaceholder?: string;
    credentialDocument: FileMetadata | null;
  };
  serviceDetails?: {
    servicesOffered: string[];
    specialties: string[];
    modalities: string[];
    locations: string[];
    acceptedCoverageOptions: string[];
    slidingScaleAvailable: boolean;
    availability: string;
    clinicianCount: number;
  };
  references?: {
    reference1Name: string;
    reference1Relationship: string;
    reference1Email: string;
    reference1Status: 'not_sent' | 'requested' | 'received';
    reference2Name: string;
    reference2Relationship: string;
    reference2Email: string;
    reference2Status: 'not_sent' | 'requested' | 'received';
  };
  verification?: VerificationInfo;
  createdAt: any;
  updatedAt: any;

  // Legacy/flat support
  organizationName?: string;
  organizationType?: 'clinic' | 'hospital' | 'group_practice' | 'telehealth_group' | 'community_clinic' | 'support_org';
  verificationStatus?: 'draft' | 'pending' | 'verified' | 'rejected' | 'request_info';
  services?: string[];
  specialties?: string[];
  modalities?: string[];
  coverageOptions?: string[];
  locations?: string[];
  availability?: string;
}

export interface SoloProviderProfile {
  userId: string;
  profile?: {
    displayName: string;
    providerTitle: string;
    bio: string;
    profilePhoto: FileMetadata | null;
    contactEmail: string;
    contactPhone: string;
  };
  licensure?: {
    licenseType: string;
    licenseNumberPlaceholder: string;
    licenseState: string;
    licenseExpirationDate: string;
    licenseDocument: FileMetadata | null;
    npiPlaceholder?: string;
    telehealthStates: string[];
  };
  careDetails?: {
    specialties: string[];
    modalities: string[];
    acceptedCoverageOptions: string[];
    selfPayRate: string;
    slidingScaleAvailable: boolean;
    languages: string[];
    availability: string;
  };
  references?: {
    reference1Name: string;
    reference1Relationship: string;
    reference1Email: string;
    reference1Phone?: string;
    reference1Status: 'not_sent' | 'requested' | 'received';
    reference2Name: string;
    reference2Relationship: string;
    reference2Email: string;
    reference2Phone?: string;
    reference2Status: 'not_sent' | 'requested' | 'received';
  };
  verification?: VerificationInfo;
  createdAt: any;
  updatedAt: any;

  // Legacy/flat support
  displayName?: string;
  licenseType?: string;
  licenseState?: string;
  licenseNumberPlaceholder?: string;
  specialties?: string[];
  modalities?: string[];
  coverageOptions?: string[];
  availability?: string;
  verificationStatus?: 'draft' | 'pending' | 'verified' | 'rejected' | 'request_info';
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
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  appointmentType?: string;
  appointmentNotes?: string;
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

export interface ChatMessageDoc {
  messageId?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export interface SupportPlanTask {
  id: string;
  title: string;
  description: string;
  category: 'preparation' | 'reflection' | 'sleep' | 'grounding' | 'outreach' | 'follow_up' | 'reading' | 'custom';
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  patientNote?: string;
}

export interface SupportPlanResource {
  id: string;
  title: string;
  type: 'worksheet' | 'reading' | 'checklist' | 'sleep_log' | 'grounding_exercise' | 'external_link' | 'custom';
  description: string;
  url?: string;
  content?: string;
  demoOnly: boolean;
}

export interface SupportPlanDoc {
  planId?: string;
  patientId: string;
  providerId: string;
  providerType: 'solo_provider' | 'provider_org';
  providerName: string;
  referralId: string;
  carePacketId: string;
  title: string;
  status: 'draft' | 'shared' | 'archived';
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  sharedAt?: any;
  providerNotes?: string;
  patientProgressSummary?: string;
  tasks: SupportPlanTask[];
  resources: SupportPlanResource[];
}

