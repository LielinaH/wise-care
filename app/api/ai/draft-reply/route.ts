import { NextResponse } from 'next/server';
import { draftReplyFromAI } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { messages, providerName } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid payload: messages array is required' }, { status: 400 });
    }

    const draft = await draftReplyFromAI(messages, providerName || 'Provider');
    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error in Draft Reply API route:', error);
    return NextResponse.json(
      { error: 'Internal server error drafting reply' },
      { status: 500 }
    );
  }
}
