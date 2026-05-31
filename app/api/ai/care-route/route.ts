import { NextResponse } from 'next/server';
import { IntakeAnswers } from '@/lib/types';
import { hasImmediateCrisisSignal } from '@/lib/ai/safety';
import { getCareRoute } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const intakeAnswers = (await request.json()) as IntakeAnswers;

    // Validate request body basic fields
    if (!intakeAnswers || !intakeAnswers.concerns) {
      return NextResponse.json({ error: 'Invalid intake data' }, { status: 400 });
    }

    // 1. Deterministic safety check
    const isCrisis =
      intakeAnswers.safety === 'immediate' ||
      hasImmediateCrisisSignal(intakeAnswers.concernDetail || '') ||
      intakeAnswers.concerns.some(c => hasImmediateCrisisSignal(c));

    if (isCrisis) {
      // Return crisis route immediately without calling Gemini
      return NextResponse.json({
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
          state: intakeAnswers.stateName || 'All',
        },
        safetyMessage: 'If you are thinking of harming yourself or someone else, please connect with a live crisis counselor now. They are free, confidential, and available 24/7.',
        isFallback: false,
      });
    }

    // 2. Standard Gemini AI Care Route generation
    const careRouteResult = await getCareRoute(intakeAnswers);
    return NextResponse.json(careRouteResult);
  } catch (error) {
    console.error('Error in Care Route API route:', error);
    return NextResponse.json(
      { error: 'Internal server error processing care route' },
      { status: 500 }
    );
  }
}
