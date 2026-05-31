import { GoogleGenAI } from '@google/genai';
import { IntakeAnswers, CareRouteResult, CarePacket, FollowUpResult } from '../types';
import { CARE_ROUTE_SYSTEM_PROMPT, CARE_PACKET_SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from './prompts';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Initialize the Gemini client if the API key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// JSON schema definition for CareRouteResult
const careRouteResponseSchema = {
  type: 'OBJECT',
  properties: {
    riskLevel: {
      type: 'STRING',
      enum: ['low', 'moderate', 'high', 'crisis'],
    },
    recommendedRoute: { type: 'STRING' },
    recommendedSupportTypes: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    reasoningSummary: { type: 'STRING' },
    detectedBarriers: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    careGoals: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    nextSteps: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    matchingCriteria: {
      type: 'OBJECT',
      properties: {
        supportTypes: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        modality: { type: 'STRING' },
        paymentPreference: { type: 'STRING' },
        urgency: { type: 'STRING' },
        state: { type: 'STRING' },
      },
      required: ['supportTypes', 'modality', 'paymentPreference', 'urgency', 'state'],
    },
    safetyMessage: { type: 'STRING' },
  },
  required: [
    'riskLevel',
    'recommendedRoute',
    'recommendedSupportTypes',
    'reasoningSummary',
    'detectedBarriers',
    'careGoals',
    'nextSteps',
    'matchingCriteria',
    'safetyMessage',
  ],
};

// JSON schema definition for CarePacket
const carePacketResponseSchema = {
  type: 'OBJECT',
  properties: {
    mainConcerns: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    timeline: { type: 'STRING' },
    dailyLifeImpact: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    careGoals: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    questionsToAskProvider: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    materialsToPrepare: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    insurancePaymentNotes: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    suggestedOutreachMessage: { type: 'STRING' },
    nextStepChecklist: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    shareableSummary: { type: 'STRING' },
  },
  required: [
    'mainConcerns',
    'timeline',
    'dailyLifeImpact',
    'careGoals',
    'questionsToAskProvider',
    'materialsToPrepare',
    'insurancePaymentNotes',
    'suggestedOutreachMessage',
    'nextStepChecklist',
    'shareableSummary',
  ],
};

// JSON schema definition for FollowUpResult
const followUpResponseSchema = {
  type: 'OBJECT',
  properties: {
    blockerSummary: { type: 'STRING' },
    recommendedAdjustment: { type: 'STRING' },
    nextBestActions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    encouragement: { type: 'STRING' },
  },
  required: ['blockerSummary', 'recommendedAdjustment', 'nextBestActions', 'encouragement'],
};

/**
 * Calls Gemini or falls back to mock Care Route.
 */
export async function getCareRoute(intake: IntakeAnswers): Promise<CareRouteResult> {
  const isCrisis = intake.safety === 'immediate';
  if (isCrisis) {
    return getCrisisRoute(intake);
  }

  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback care route.');
    return getFallbackCareRoute(intake);
  }

  try {
    const userPrompt = `
      User concerns: ${intake.concerns.join(', ')}
      User description: ${intake.concernDetail || 'None provided'}
      Duration: ${intake.duration}
      Intensity: ${intake.intensity} / 10
      Impact: ${intake.impact.join(', ')}
      Safety Check: ${intake.safety}
      Preferred Support: ${intake.preference}
      Insurance/Payment: ${intake.insurance || 'Not specified'}
      Modality: ${intake.modality || 'Not specified'}
      Location State: ${intake.stateName || 'Not specified'}
      Urgency: ${intake.urgency || 'Not specified'}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: CARE_ROUTE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: careRouteResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text) as CareRouteResult;
    return { ...result, isFallback: false };
  } catch (error) {
    console.error('Error generating care route with Gemini:', error);
    return getFallbackCareRoute(intake);
  }
}

/**
 * Calls Gemini or falls back to mock Care Packet.
 */
export async function getCarePacket(intake: IntakeAnswers, careRoute: CareRouteResult, providerName?: string): Promise<CarePacket> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback care packet.');
    return getFallbackCarePacket(intake, careRoute, providerName);
  }

  try {
    const userPrompt = `
      Intake Answers: ${JSON.stringify(intake)}
      Care Route Result: ${JSON.stringify(careRoute)}
      Selected Provider: ${providerName || 'None selected'}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: CARE_PACKET_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: carePacketResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text) as CarePacket;
    return { ...result, isFallback: false };
  } catch (error) {
    console.error('Error generating care packet with Gemini:', error);
    return getFallbackCarePacket(intake, careRoute, providerName);
  }
}

/**
 * Calls Gemini or falls back to mock Follow-Up.
 */
export async function getFollowUpAdjustment(
  contacted: boolean,
  scheduled: boolean,
  blocker: string,
  careRoute?: string
): Promise<FollowUpResult> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback follow-up adjustment.');
    return getFallbackFollowUp(contacted, scheduled, blocker, careRoute);
  }

  try {
    const userPrompt = `
      User contacted provider: ${contacted}
      User scheduled appointment: ${scheduled}
      User selected blocker/barrier: ${blocker}
      Original Care Route recommended: ${careRoute || 'Not specified'}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: FOLLOW_UP_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: followUpResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text) as FollowUpResult;
    return { ...result, isFallback: false };
  } catch (error) {
    console.error('Error generating follow-up adjustment with Gemini:', error);
    return getFallbackFollowUp(contacted, scheduled, blocker, careRoute);
  }
}

// ─── Crisis and Fallback Generators ───

function getCrisisRoute(intake: IntakeAnswers): CareRouteResult {
  return {
    riskLevel: 'crisis',
    recommendedRoute: 'Immediate Crisis Support',
    recommendedSupportTypes: ['Crisis Hotline Support', 'Emergency Services'],
    reasoningSummary: 'Based on your answers, there are indicators of immediate distress or self-harm risk. Your safety is the priority.',
    detectedBarriers: ['Urgent safety risk requires immediate human connection rather than scheduling queues'],
    careGoals: ['Ensure safety in the immediate term', 'Connect with a live crisis counselor', 'Formulate a safe plan'],
    nextSteps: [
      'Call or text 988 immediately to reach the Suicide & Crisis Lifeline.',
      'Go to the nearest emergency room or call 911 if you cannot stay safe.',
    ],
    matchingCriteria: {
      supportTypes: ['Crisis support'],
      modality: 'Telehealth',
      paymentPreference: 'Free',
      urgency: 'Immediate',
      state: intake.stateName || 'All',
    },
    safetyMessage: 'If you are thinking of harming yourself or someone else, please connect with a live crisis counselor now. They are free, confidential, and available 24/7.',
    isFallback: false, // Explicitly standard crisis flow
  };
}

function getFallbackCareRoute(intake: IntakeAnswers): CareRouteResult {
  const intensityLabel = intake.intensity >= 7 ? 'significant' : 'manageable';
  const primaryConcern = intake.concerns[0] || 'general well-being';
  
  return {
    riskLevel: intake.intensity >= 7 ? 'high' : 'moderate',
    recommendedRoute: `Therapy focusing on ${primaryConcern} and related daily impact`,
    recommendedSupportTypes: ['Individual Talk Therapy', 'Peer Support Group', 'Self-Guided Wellness Manual'],
    reasoningSummary: `You reported ${primaryConcern} concerns with a ${intensityLabel} intensity score of ${intake.intensity}/10. Talk therapy may provide a structured space to build coping mechanisms.`,
    detectedBarriers: [
      intake.insurance ? `Verifying network compatibility for ${intake.insurance}` : 'Paying out-of-pocket without active insurance coverage',
      intake.modality === 'In-person' ? 'Longer waitlists for face-to-face appointments' : 'None reported',
    ],
    careGoals: [
      `Develop tools to manage ${primaryConcern} symptoms`,
      'Establish a routine to reduce daily life disruption',
      'Learn grounding techniques for times of high stress',
    ],
    nextSteps: [
      'Review your matched list of providers below.',
      'Prepare your shareable Wise Care Packet.',
      'Reach out for a 15-minute consultation call.',
    ],
    matchingCriteria: {
      supportTypes: ['Therapist', 'Group practice'],
      modality: intake.modality || 'Either is fine',
      paymentPreference: intake.insurance || 'Self-pay',
      urgency: intake.urgency || '1-2w',
      state: intake.stateName || 'California',
    },
    safetyMessage: 'Wise Care is a care navigation helper. We do not diagnose, treat, or replace licensed medical professionals. If safety risk increases, call 988 or 911.',
    isFallback: true,
  };
}

function getFallbackCarePacket(intake: IntakeAnswers, careRoute: CareRouteResult, providerName?: string): CarePacket {
  const concerns = intake.concerns.length > 0 ? intake.concerns : ['General support'];
  const providerText = providerName ? `at ${providerName}` : 'your selected clinician';

  return {
    mainConcerns: concerns.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    timeline: `Experiencing these challenges for a duration of ${intake.duration}.`,
    dailyLifeImpact: intake.impact.map(i => `Getting harder to manage: ${i}`),
    careGoals: careRoute.careGoals,
    questionsToAskProvider: [
      'Do you have experience supporting clients with these specific concerns?',
      'How do you structure your typical sessions, and what is your therapeutic style?',
      'How does billing work with my payment/insurance method?',
    ],
    materialsToPrepare: [
      'Your insurance card or coverage documentation',
      'This Wise Care summary packet',
      'List of any medications or previous treatment records',
    ],
    insurancePaymentNotes: [
      intake.insurance ? `You indicated coverage under: ${intake.insurance}` : 'Self-pay / sliding scale requested.',
      'We recommend confirming network status directly with the provider before the first session.',
    ],
    suggestedOutreachMessage: `Hello, my name is Wise Care Member. I am seeking care for ${concerns.join(' and ')} which has been going on for a few ${intake.duration}. I completed a care-navigation check-in and would like to schedule a brief consultation to see if we might be a good fit. I look forward to hearing from you!`,
    nextStepChecklist: [
      'Verify insurance benefits',
      'Copy the suggested outreach message',
      'Send a connection request',
    ],
    shareableSummary: `Wise Care member seeking support for ${concerns.join(', ')}. Symptoms are rated as ${intake.intensity}/10 intensity, impacting: ${intake.impact.join(', ')}. Main care goal is to learn strategies to manage these stressors.`,
    isFallback: true,
  };
}

function getFallbackFollowUp(
  contacted: boolean,
  scheduled: boolean,
  blocker: string,
  careRoute?: string
): FollowUpResult {
  let adjustment = 'Consider broadening your search parameters.';
  let actions = ['Filter for sliding scale options', 'Look into peer support groups'];

  if (blocker === 'cost') {
    adjustment = 'Explore providers offering sliding scale payments or community-based clinics that operate on public programs.';
    actions = ['Look up OpenPath Community Support', 'Check sliding scale availability'];
  } else if (blocker === 'waitlist') {
    adjustment = 'Try scheduling intake calls with multiple providers or join a peer-led group while waiting.';
    actions = ['Register for Stillwater Peer Support Group', 'Contact CalmBridge Group for group openings'];
  } else if (blocker === 'anxiety') {
    adjustment = 'Writing down your questions or having a trusted friend help send the message can make the first contact easier.';
    actions = ['Use the pre-written email template', 'Try starting with a text-based crisis line if you need low-pressure support'];
  }

  return {
    blockerSummary: `Stuck on search due to: ${blocker || 'no provider availability'}.`,
    recommendedAdjustment: adjustment,
    nextBestActions: actions,
    encouragement: 'Finding care is a journey that often requires several attempts. You did the right thing by checking back in. We are here to help guide the next turn.',
    isFallback: true,
  };
}
