import { GoogleGenAI } from '@google/genai';
import { IntakeAnswers, CareRouteResult, CarePacket, FollowUpResult, Provider } from '../types';
import { CARE_ROUTE_SYSTEM_PROMPT, CARE_PACKET_SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from './prompts';
import { matchProviders } from '../matching/matchProviders';
import { ChatMessageDoc, SupportPlanTask, SupportPlanResource } from '../firebase/types';
import { SUPPORT_PLAN_TEMPLATES } from '../data/supportPlanTemplates';

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

/**
 * Enhances raw availability hours into a clean, professional description using Gemini.
 */
export async function enhanceAvailabilityHours(rawHours: string): Promise<string> {
  const trimmed = rawHours.trim();
  if (!trimmed) return 'Accepting new clients';

  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback availability hour cleanup.');
    return getFallbackAvailabilityHours(trimmed);
  }

  try {
    const systemPrompt = `You are an AI assistant for a professional healthcare and care navigation platform.
The user (a clinic or an individual clinician) has typed their available hours in a casual, short, or typo-prone format.
Your task is to reformat their input into a clear, professional, well-formatted availability summary suitable for a public healthcare directory.

Examples:
- "9to5 monday to firday" -> "Monday - Friday: 9:00 AM - 5:00 PM"
- "anytime anytime" -> "Flexible / Open Availability"
- "weekends only" -> "Saturday & Sunday: Flexible hours"
- "tue wed 5 to 8pm" -> "Tuesday & Wednesday: 5:00 PM - 8:00 PM"
- "m-f morning" -> "Monday - Friday: Mornings"
- "by appointment" -> "By Appointment Only"

Return ONLY the enhanced, clean, professional availability description. Do not include quotes, conversational filler, markdown formatting (like bolding), or explanation. Just the text.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Raw text: "${trimmed}"`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    return response.text.trim().replace(/^"(.*)"$/, '$1'); // clean quotes if any
  } catch (error) {
    console.error('Error enhancing availability hours with Gemini:', error);
    return getFallbackAvailabilityHours(trimmed);
  }
}

function getFallbackAvailabilityHours(rawHours: string): string {
  const normalized = rawHours.toLowerCase();
  if (normalized.includes('anytime') || normalized.includes('any time') || normalized.includes('24/7') || normalized.includes('always')) {
    return 'Flexible / Open Availability';
  }
  if (normalized.includes('9to5') || normalized.includes('9 to 5') || normalized.includes('9-5')) {
    let days = 'Monday - Friday';
    if (normalized.includes('mon') && normalized.includes('sat')) days = 'Monday - Saturday';
    return `${days}: 9:00 AM - 5:00 PM`;
  }
  if (normalized.includes('9to6') || normalized.includes('9 to 6') || normalized.includes('9-6')) {
    return 'Monday - Friday: 9:00 AM - 6:00 PM';
  }
  if (normalized.includes('weekend')) {
    return 'Saturday & Sunday: Flexible Availability';
  }
  if (normalized.includes('evening')) {
    return 'Weekday evenings: 5:00 PM - 8:00 PM';
  }
  if (normalized.includes('morning')) {
    return 'Weekday mornings: 8:00 AM - 12:00 PM';
  }
  // Default fallback: Capitalize the first letter
  return rawHours.charAt(0).toUpperCase() + rawHours.slice(1);
}

const matchProvidersResponseSchema = {
  type: 'OBJECT',
  properties: {
    rankedMatches: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          matchScore: { type: 'INTEGER' },
          matchReason: { type: 'STRING' }
        },
        required: ['id', 'matchScore', 'matchReason']
      }
    }
  },
  required: ['rankedMatches']
};

const generateSlotsResponseSchema = {
  type: 'OBJECT',
  properties: {
    slots: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          date: { type: 'STRING' },
          timeSlots: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        required: ['date', 'timeSlots']
      }
    }
  },
  required: ['slots']
};

/**
 * Uses Gemini to rank, score, and provide reasoning for each provider based on the patient's intake.
 */
export async function matchProvidersWithAI(
  intake: IntakeAnswers, 
  providers: Provider[]
): Promise<{ id: string; matchScore: number; matchReason: string; }[]> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback matching.');
    return getFallbackAIMatching(intake, providers);
  }

  try {
    const intakePrompt = `
      Patient Intake Profile:
      - Concerns: ${intake.concerns.join(', ')}
      - Natural Language Description: ${intake.concernDetail || 'None provided'}
      - Modality Preference: ${intake.modality || 'Not specified'}
      - Payment/Insurance Preference: ${intake.insurance || 'Not specified'}
      - Urgency: ${intake.urgency || 'Not specified'}
      - State: ${intake.stateName || 'Not specified'}
    `;

    const providerListText = providers.map(p => `
      Provider ID: ${p.id}
      Name: ${p.name}
      Type: ${p.type}
      Licensure: ${p.licensure}
      Specialties: ${p.specialty.join(', ')}
      Modalities: ${p.modality.join(', ')}
      Accepted Coverage: ${p.insurance.join(', ')}
      Sliding Scale: ${p.slidingScale ? 'Yes' : 'No'}
      Availability: ${p.nextAvailable}
      Session Cost: ${p.sessionCost}
    `).join('\n---\n');

    const userPrompt = `
      Evaluate the suitability of each candidate provider for this patient.
      
      ${intakePrompt}

      Candidate Providers:
      ${providerListText}
      
      For each provider, assign a score between 0 and 100 representing compatibility.
      - Strong clinical fit (specialties matching the concerns) and practical fit (insurance, modality, state licensure) should get scores above 80.
      - If the state licensing doesn't match the patient's state, penalize heavily (score below 40).
      - Provide a concise 1-2 sentence "matchReason" detailing why this provider is a good fit or any minor discrepancies. Do not use diagnostic language (e.g. do not state "you have severe anxiety", instead say "matches your goals for managing anxiety").
      
      Return a ranked list of matched providers.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: 'You are a healthcare provider matching coordinator. Rate compatibility and describe why in a non-diagnostic, friendly, professional manner.',
        responseMimeType: 'application/json',
        responseSchema: matchProvidersResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text) as { rankedMatches: { id: string; matchScore: number; matchReason: string; }[] };
    return result.rankedMatches;
  } catch (error) {
    console.error('Error generating AI matches with Gemini:', error);
    return getFallbackAIMatching(intake, providers);
  }
}

function getFallbackAIMatching(
  intake: IntakeAnswers, 
  providers: Provider[]
): { id: string; matchScore: number; matchReason: string; }[] {
  const clientMatched = matchProviders(intake, providers);
  return clientMatched.map(p => ({
    id: p.id,
    matchScore: p.matchScore,
    matchReason: p.matchReason + ' (AI engine fallback)'
  }));
}

/**
 * Uses Gemini to parse a provider's casual availability string (e.g. "Tue/Thu afternoons · 1-5pm")
 * into a structured list of date and time slots for the next 7 days.
 */
export async function generateSlotsFromAvailability(
  availabilityStr: string
): Promise<{ date: string; timeSlots: string[]; }[]> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback slot generator.');
    return getFallbackSlots(availabilityStr);
  }

  try {
    const today = new Date();
    const systemPrompt = `You are a clinical scheduling parser.
Your task is to take a provider's raw availability string and parse it to generate a structured set of appointment slots (date and time) for the upcoming 7 days starting from today: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Identify which days of the week are available and which hours. Generate hourly slots (e.g. "10:00 AM", "11:00 AM", "1:00 PM").
Example: "Tue/Thu afternoons · 1-5pm" -> Generate slots for upcoming Tuesday and Thursday between 1:00 PM and 5:00 PM.

Return the response in a structured JSON schema.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Raw Availability: "${availabilityStr}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: generateSlotsResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text) as { slots: { date: string; timeSlots: string[]; }[] };
    return result.slots;
  } catch (error) {
    console.error('Error parsing slots with Gemini:', error);
    return getFallbackSlots(availabilityStr);
  }
}

function getFallbackSlots(availabilityStr: string): { date: string; timeSlots: string[]; }[] {
  const slots: { date: string; timeSlots: string[]; }[] = [];
  const today = new Date();
  
  const normalized = availabilityStr.toLowerCase();
  const isWeekendOnly = normalized.includes('weekend') || normalized.includes('saturday') || normalized.includes('sunday');
  const isTueThu = normalized.includes('tue') || normalized.includes('thu');
  
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    let include = false;
    let times = ['9:00 AM', '11:00 AM', '2:00 PM', '4:30 PM'];
    
    if (isWeekendOnly) {
      if (dayName === 'Saturday' || dayName === 'Sunday') {
        include = true;
        times = ['10:00 AM', '12:00 PM', '2:00 PM'];
      }
    } else if (isTueThu) {
      if (dayName === 'Tuesday' || dayName === 'Thursday') {
        include = true;
        times = ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
      }
    } else {
      if (dayName !== 'Saturday' && dayName !== 'Sunday') {
        include = true;
        if (normalized.includes('evening')) {
          times = ['5:00 PM', '6:00 PM', '7:00 PM'];
        } else if (normalized.includes('morning')) {
          times = ['8:00 AM', '9:30 AM', '11:00 AM'];
        }
      }
    }
    
    if (include) {
      slots.push({
        date: formattedDate,
        timeSlots: times
      });
    }
  }
  
  return slots;
}

/**
 * Uses Gemini to summarize the patient's care packet details and chat logs into a copyable clinical brief.
 */
export async function summarizeChatHistory(
  messages: ChatMessageDoc[],
  intakeAnswers: any
): Promise<string> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback chat summarizer.');
    return getFallbackChatSummary(messages, intakeAnswers);
  }

  try {
    const chatLog = messages.map(m => `${m.senderName}: "${m.text}"`).join('\n');
    const intakeDetail = intakeAnswers ? `
      - Primary Concerns: ${intakeAnswers.concerns?.join(', ') || 'None listed'}
      - Detail: ${intakeAnswers.concernDetail || 'None provided'}
      - Urgency: ${intakeAnswers.urgency || 'Flexible'}
      - Payment/Insurance: ${intakeAnswers.insurance || 'Self-pay'}
    ` : 'No intake answers provided';

    const systemPrompt = `You are a clinical assistant. Your task is to draft a professional, clear clinical intake summary brief.
Follow the SOAP note structure:
- SUBJECTIVE: Patient's reported symptoms, concerns, duration, and daily impact.
- OBJECTIVE: Observations from message style or stated facts (e.g. "Patient shared intake packet; communicated in 3 messages"). Do not make clinical diagnostics.
- ASSESSMENT: Match assessment (e.g. "Patient concerns of anxiety/sleep align with provider modality"). Do not diagnose clinical diseases (e.g., do not write "Major Depressive Disorder", use "reported depressive symptoms").
- PLAN: Suggested next steps, including the scheduled intake session.

Keep it structured, clear, and professional. Write a disclaimer at the top: "**[AI-Generated Clinical Summary Draft - For Provider Review Only]**"`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Intake Answers:\n${intakeDetail}\n\nChat Messages:\n${chatLog}`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return response.text || getFallbackChatSummary(messages, intakeAnswers);
  } catch (error) {
    console.error('Error generating chat summary with Gemini:', error);
    return getFallbackChatSummary(messages, intakeAnswers);
  }
}

function getFallbackChatSummary(messages: ChatMessageDoc[], intakeAnswers: any): string {
  const concerns = intakeAnswers?.concerns?.join(', ') || 'Anxiety/Sleep difficulty';
  const detail = intakeAnswers?.concernDetail || 'No detailed description provided.';
  const msgCount = messages.length;
  
  return `**[AI-Generated Clinical Summary Draft - For Provider Review Only]**

### SOAP Note Format (Fallback Mode)

**SUBJECTIVE:**
- **Chief Complaint:** Patient reports concerns regarding: ${concerns}.
- **Patient Context:** ${detail}
- **History of Present Illness (HPI):** Symptoms described as ongoing. Daily life areas impacted include mood and routine sleep habits.

**OBJECTIVE:**
- Patient completed digital intake check-in and successfully shared their Care Packet.
- Provider accepted the referral.
- Secure chat connection established. Total messages in log: ${msgCount}.

**ASSESSMENT:**
- **Clinical Match Evaluation:** Patient concerns of ${concerns} align with the provider's scope of practice. Modality preference matched.
- No immediate safety crisis triggers detected in standard fields.

**PLAN:**
- Proceed with the scheduled intake consultation session.
- Discuss treatment goals, clinic boundaries, and payment setup during first live check-in.`;
}

/**
 * Uses Gemini to draft a professional, warm clinician response based on the patient's messages.
 */
export async function draftReplyFromAI(
  messages: ChatMessageDoc[],
  providerName: string
): Promise<string> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using fallback clinician reply draft.');
    return getFallbackReplyDraft(messages);
  }

  try {
    const chatLog = messages.slice(-5).map(m => `${m.senderName}: "${m.text}"`).join('\n');

    const systemPrompt = `You are a clinical communications assistant. Draft a warm, professional, and empathetic response from the provider (${providerName}) to the patient based on the chat history.
Guidelines:
- Keep the response short (2-3 sentences).
- Do not make any diagnostic assertions or treatment commitments.
- Propose or acknowledge the next step (e.g. looking forward to meeting in the intake session).
- Do not sign with placeholder names, write from the perspective of ${providerName}.
- Return ONLY the response text. Do not include quotes, greetings like "Here is the response:", or markdown formatting. Just the reply.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Recent Chat Messages:\n${chatLog}`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return response.text?.trim().replace(/^"(.*)"$/, '$1') || getFallbackReplyDraft(messages);
  } catch (error) {
    console.error('Error drafting reply with Gemini:', error);
    return getFallbackReplyDraft(messages);
  }
}

function getFallbackReplyDraft(messages: ChatMessageDoc[]): string {
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && lastMsg.text.toLowerCase().includes('schedule')) {
    return "Thank you for scheduling the intake session! I've received the confirmation and look forward to meeting with you. Please let me know if you need to adjust the time.";
  }
  return "Thank you for reaching out and sharing your care packet details. I have reviewed your goals and concerns, and I look forward to connecting during our scheduled consultation. Let me know if you have any questions in the meantime.";
}

const supportPlanResponseSchema = {
  type: 'OBJECT',
  properties: {
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          category: {
            type: 'STRING',
            enum: ['preparation', 'reflection', 'sleep', 'grounding', 'outreach', 'follow_up', 'reading', 'custom']
          }
        },
        required: ['id', 'title', 'description', 'category']
      }
    },
    resources: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: ['worksheet', 'reading', 'checklist', 'sleep_log', 'grounding_exercise', 'external_link', 'custom']
          },
          description: { type: 'STRING' },
          content: { type: 'STRING' }
        },
        required: ['title', 'type', 'description', 'content']
      }
    }
  },
  required: ['tasks', 'resources']
};

/**
 * Uses Gemini to generate a supportive prep-oriented support plan draft based on the patient's Care Packet details.
 */
export async function generateSupportPlanDraft(
  carePacket: CarePacket,
  templateId: string,
  providerName: string
): Promise<{ tasks: SupportPlanTask[]; resources: SupportPlanResource[]; }> {
  const fallbackTemplate = SUPPORT_PLAN_TEMPLATES.find(t => t.id === templateId) || SUPPORT_PLAN_TEMPLATES[0];

  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using template defaults for support plan.');
    return {
      tasks: fallbackTemplate.defaultTasks.map(t => ({ ...t, completed: false } as SupportPlanTask)),
      resources: fallbackTemplate.defaultResources.map((r, idx) => ({ ...r, id: `res_${idx}`, demoOnly: true } as SupportPlanResource))
    };
  }

  try {
    const packetDetail = `
      - Patient concerns: ${carePacket.mainConcerns?.join(', ') || 'General concerns'}
      - Timeline: ${carePacket.timeline || ''}
      - Daily life impact: ${carePacket.dailyLifeImpact?.join(', ') || ''}
      - Care goals: ${carePacket.careGoals?.join(', ') || ''}
    `;

    const systemPrompt = `You are a clinical care coordinator assistant.
Your task is to draft a professional, non-clinical, preparation-focused Support Plan for a patient based on their intake Care Packet.
This plan must help them prepare for their upcoming live intake session with the provider (${providerName}).

Rules:
- Do NOT prescribe medical treatment, suggest medications, or diagnose clinical conditions.
- Focus on preparation tasks, self-reflection prompts, sleep routines, grounding exercises, or community outreach tasks.
- Keep the tasks friendly, low-risk, and supportive.
- Customize the tasks slightly to relate to the patient's concerns (e.g. if the concern is sleep, write tasks targeting sleep hygiene; if anxiety, write grounding box breathing).
- Map each task to a category: preparation, reflection, sleep, grounding, outreach, follow_up, reading, custom.
- For resources, draft 1-2 useful educational resources (worksheets, grounding guides, or reading outlines).

Return the response in a structured JSON schema.`;

    const userPrompt = `
      Patient Care Packet Details:
      ${packetDetail}

      Selected Template Focus: ${fallbackTemplate.title} ("${fallbackTemplate.description}")
      Provider Name: ${providerName}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: supportPlanResponseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(response.text);
    return {
      tasks: (result.tasks || []).map((t: any) => ({
        ...t,
        completed: false
      })),
      resources: (result.resources || []).map((r: any, idx: number) => ({
        ...r,
        id: `res_${idx}`,
        demoOnly: true
      }))
    };
  } catch (error) {
    console.error('Error generating AI support plan draft:', error);
    return {
      tasks: fallbackTemplate.defaultTasks.map(t => ({ ...t, completed: false } as SupportPlanTask)),
      resources: fallbackTemplate.defaultResources.map((r, idx) => ({ ...r, id: `res_${idx}`, demoOnly: true } as SupportPlanResource))
    };
  }
}
