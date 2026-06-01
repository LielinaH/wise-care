import { NextResponse } from 'next/server';
import { generateSlotsFromAvailability } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { availability } = await request.json();

    if (typeof availability !== 'string') {
      return NextResponse.json({ error: 'Invalid availability: string required' }, { status: 400 });
    }

    const slots = await generateSlotsFromAvailability(availability);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error in Generate Slots API route:', error);
    return NextResponse.json(
      { error: 'Internal server error generating slots' },
      { status: 500 }
    );
  }
}
