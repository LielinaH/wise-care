import { NextResponse } from 'next/server';
import { matchProvidersWithAI } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { intake, providers } = await request.json();

    if (!intake || !providers || !Array.isArray(providers)) {
      return NextResponse.json({ error: 'Invalid payload: intake and providers are required' }, { status: 400 });
    }

    const matched = await matchProvidersWithAI(intake, providers);
    return NextResponse.json({ matched });
  } catch (error) {
    console.error('Error in Match Providers API route:', error);
    return NextResponse.json(
      { error: 'Internal server error matching providers' },
      { status: 500 }
    );
  }
}
