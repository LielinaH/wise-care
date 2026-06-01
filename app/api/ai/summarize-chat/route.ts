import { NextResponse } from 'next/server';
import { summarizeChatHistory } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { messages, intakeAnswers } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid payload: messages array is required' }, { status: 400 });
    }

    const summary = await summarizeChatHistory(messages, intakeAnswers);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in Summarize Chat API route:', error);
    return NextResponse.json(
      { error: 'Internal server error summarizing chat' },
      { status: 500 }
    );
  }
}
