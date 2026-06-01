export interface IntakeAnswers {
  concerns: string[];
  concernDetail?: string;
  duration: 'days' | 'weeks' | 'months' | 'longer';
  intensity: number; // 1 to 10
  impact: string[];
  safety: 'none' | 'passing' | 'recent' | 'immediate';
  preference: 'therapy' | 'medication' | 'group' | 'community' | 'self' | 'unsure';
  insurance?: string;
  modality?: string;
  stateName?: string;
  urgency?: 'asap' | '1-2w' | 'month' | 'flexible';
}

export interface CareRouteResult {
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
  isFallback?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  licensure: string;
  specialty: string[];
  modality: string[];
  insurance: string[];
  slidingScale: boolean;
  nextAvailable: string;
  sessionCost: string;
  matchReason: string;
  matchScore: number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  contactInfo: string;
  urgencyLevel: 'crisis' | 'standard';
}

export interface Referral {
  id: string;
  name: string;
  route: string;
  risk: 'low' | 'medium' | 'high' | 'crisis';
  age: string;
  received: string;
  insurance: string;
  summary: string;
  status?: 'accepted' | 'declined' | 'waitlisted' | 'pending' | 'request_info' | 'withdrawn';
  providerId?: string;
  providerName?: string;
  createdAt?: any;
  updatedAt?: any;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  appointmentType?: string;
  appointmentNotes?: string;
}


export interface CarePacket {
  mainConcerns: string[];
  timeline: string;
  dailyLifeImpact: string[];
  careGoals: string[];
  questionsToAskProvider: string[];
  materialsToPrepare: string[];
  insurancePaymentNotes: string[];
  suggestedOutreachMessage: string;
  nextStepChecklist: string[];
  shareableSummary: string;
  isFallback?: boolean;
}

export interface FollowUpInput {
  contactedProvider: boolean;
  scheduledAppointment: boolean;
  blocker?: string;
  careRoute?: string;
}

export interface FollowUpResult {
  blockerSummary: string;
  recommendedAdjustment: string;
  nextBestActions: string[];
  encouragement: string;
  isFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string; // ISO string or formatted for client view
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

