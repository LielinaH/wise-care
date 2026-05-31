import { NextResponse } from 'next/server';
import { getFollowUpAdjustment } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
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
