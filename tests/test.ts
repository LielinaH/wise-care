import { hasImmediateCrisisSignal } from '../lib/ai/safety';
import { matchProviders } from '../lib/matching/matchProviders';
import { CareRouteSchema, CarePacketSchema } from '../lib/ai/schemas';
import { MOCK_PROVIDERS } from '../lib/data/mockProviders';
import { IntakeAnswers } from '../lib/types';

function runSafetyTests() {
  console.log('--- Running Safety Guard Tests ---');
  
  const crisisInputs = [
    'I want to kill myself',
    'I am thinking of self-harm',
    'My partner is abusing me, I am in immediate danger',
    'I took an overdose of pills',
  ];

  const cleanInputs = [
    'I am feeling stressed about my exam next week',
    'I struggle to sleep and have low energy',
    'Looking for a couples therapist in California',
  ];

  crisisInputs.forEach(input => {
    const isCrisis = hasImmediateCrisisSignal(input);
    console.log(`Input: "${input}" -> Crisis Flagged: ${isCrisis}`);
    if (!isCrisis) throw new Error(`Test Failed: Expected crisis to be flagged for input: ${input}`);
  });

  cleanInputs.forEach(input => {
    const isCrisis = hasImmediateCrisisSignal(input);
    console.log(`Input: "${input}" -> Crisis Flagged: ${isCrisis}`);
    if (isCrisis) throw new Error(`Test Failed: Expected clean input, but crisis was flagged for: ${input}`);
  });

  console.log('✓ Safety Guard Tests Passed.\n');
}

function runMatchingTests() {
  console.log('--- Running Provider Matching Tests ---');

  const intakeCA: IntakeAnswers = {
    concerns: ['anxiety', 'sleep'],
    duration: 'weeks',
    intensity: 6,
    impact: ['sleep', 'work'],
    safety: 'none',
    preference: 'therapy',
    insurance: 'Private Plan A',
    modality: 'Telehealth',
    stateName: 'California',
    urgency: '1-2w',
  };

  const results = matchProviders(intakeCA, MOCK_PROVIDERS);
  
  // Verify order and scoring
  console.log(`Matching for CA User with Anxiety/Sleep concerns and Private Plan A:`);
  results.forEach(p => {
    console.log(`- ${p.name}: Score ${p.matchScore}% (Modality: ${p.modality.join('/')}, Ins: ${p.insurance.join('/')})`);
  });

  const topMatch = results[0];
  if (topMatch.name !== 'Northstar Community Counseling') {
    throw new Error(`Test Failed: Expected "Northstar Community Counseling" to be the top match, got "${topMatch.name}"`);
  }
  if (topMatch.matchScore < 90) {
    throw new Error(`Test Failed: Expected top match score to be high, got ${topMatch.matchScore}`);
  }

  console.log('✓ Provider Matching Tests Passed.\n');
}

function runSchemaTests() {
  console.log('--- Running Zod Schema Validation Tests ---');

  const validRoute = {
    riskLevel: 'moderate',
    recommendedRoute: 'Talk therapy targeting stress and sleep',
    recommendedSupportTypes: ['Individual therapy', 'Peer groups'],
    reasoningSummary: 'Moderate anxiety symptoms reported.',
    detectedBarriers: ['Out-of-pocket costs'],
    careGoals: ['Build relaxation strategies', 'Sleep schedule consistency'],
    nextSteps: ['Schedule a consultation call'],
    matchingCriteria: {
      supportTypes: ['Therapist'],
      modality: 'Telehealth',
      paymentPreference: 'Self-pay',
      urgency: '1-2w',
      state: 'CA'
    },
    safetyMessage: 'Disclaimer copy'
  };

  const invalidRoute = {
    riskLevel: 'unknown-risk-level', // Invalid enum
    recommendedRoute: 'Therapy',
    // Missing required fields
  };

  // 1. Valid route parse
  const parsed = CareRouteSchema.safeParse(validRoute);
  console.log(`Valid Route Schema Parse: ${parsed.success}`);
  if (!parsed.success) {
    throw new Error('Test Failed: Expected valid CareRoute schema parsing to succeed');
  }

  // 2. Invalid route parse
  const failedParse = CareRouteSchema.safeParse(invalidRoute);
  console.log(`Invalid Route Schema Parse: ${failedParse.success ? 'succeeded (error)' : 'failed (expected)'}`);
  if (failedParse.success) {
    throw new Error('Test Failed: Expected invalid CareRoute schema parsing to fail');
  }

  console.log('✓ Zod Schema Tests Passed.\n');
}

try {
  runSafetyTests();
  runMatchingTests();
  runSchemaTests();
  console.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
} catch (error) {
  console.error('❌ A test failed:', error);
  process.exit(1);
}
