import { NextResponse } from 'next/server';
import { generateSupportPlanDraft } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { carePacket, templateId, providerName } = await request.json();

    if (!carePacket || !templateId) {
      return NextResponse.json(
        { error: 'Invalid payload: carePacket and templateId are required' },
        { status: 400 }
      );
    }

    const plan = await generateSupportPlanDraft(carePacket, templateId, providerName || 'Provider');
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error in Support Plan API route:', error);
    return NextResponse.json(
      { error: 'Internal server error drafting support plan' },
      { status: 500 }
    );
  }
}
