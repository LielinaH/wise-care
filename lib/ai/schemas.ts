import { z } from 'zod';

export const CareRouteSchema = z.object({
  riskLevel: z.enum(['low', 'moderate', 'high', 'crisis']),
  recommendedRoute: z.string(),
  recommendedSupportTypes: z.array(z.string()),
  reasoningSummary: z.string(),
  detectedBarriers: z.array(z.string()),
  careGoals: z.array(z.string()),
  nextSteps: z.array(z.string()),
  matchingCriteria: z.object({
    supportTypes: z.array(z.string()),
    modality: z.string(),
    paymentPreference: z.string(),
    urgency: z.string(),
    state: z.string(),
  }),
  safetyMessage: z.string(),
});

export const CarePacketSchema = z.object({
  mainConcerns: z.array(z.string()),
  timeline: z.string(),
  dailyLifeImpact: z.array(z.string()),
  careGoals: z.array(z.string()),
  questionsToAskProvider: z.array(z.string()),
  materialsToPrepare: z.array(z.string()),
  insurancePaymentNotes: z.array(z.string()),
  suggestedOutreachMessage: z.string(),
  nextStepChecklist: z.array(z.string()),
  shareableSummary: z.string(),
});

export const FollowUpSchema = z.object({
  blockerSummary: z.string(),
  recommendedAdjustment: z.string(),
  nextBestActions: z.array(z.string()),
  encouragement: z.string(),
});
