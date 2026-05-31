import { NextResponse } from 'next/server';
import { IntakeAnswers, CareRouteResult } from '@/lib/types';
import { getCarePacket } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    // Read the authorization header. Token verification is prototype-level in this pass.
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      console.log(`[Prototype Auth] Gemini care-packet request received token: ${token.substring(0, 10)}...`);
    }

    const { intake, careRoute, providerName } = (await request.json()) as {
      intake: IntakeAnswers;
      careRoute: CareRouteResult;
      providerName?: string;
    };

    if (!intake || !careRoute) {
      return NextResponse.json({ error: 'Missing required care routing metadata' }, { status: 400 });
    }

    const carePacket = await getCarePacket(intake, careRoute, providerName);
    return NextResponse.json(carePacket);
  } catch (error) {
    console.error('Error in Care Packet API route:', error);
    return NextResponse.json(
      { error: 'Internal server error processing care packet' },
      { status: 500 }
    );
  }
}
