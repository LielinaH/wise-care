import { NextResponse } from 'next/server';
import { getFollowUpAdjustment } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    // Read the authorization header. Token verification is prototype-level in this pass.
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      console.log(`[Prototype Auth] Gemini follow-up request received token: ${token.substring(0, 10)}...`);
    }

    const { contactedProvider, scheduledAppointment, blocker, careRoute } = await request.json();

    const followUpResult = await getFollowUpAdjustment(
      contactedProvider,
      scheduledAppointment,
      blocker,
      careRoute
    );
    return NextResponse.json(followUpResult);
  } catch (error) {
    console.error('Error in Follow-Up API route:', error);
    return NextResponse.json(
      { error: 'Internal server error processing follow-up check-in' },
      { status: 500 }
    );
  }
}
