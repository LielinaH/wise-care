import { NextResponse } from 'next/server';
import { enhanceAvailabilityHours } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { rawHours } = await request.json();

    if (typeof rawHours !== 'string') {
      return NextResponse.json({ error: 'Invalid rawHours' }, { status: 400 });
    }

    const enhanced = await enhanceAvailabilityHours(rawHours);
    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error('Error in Enhance Hours API route:', error);
    return NextResponse.json(
      { error: 'Internal server error processing hours' },
      { status: 500 }
    );
  }
}
