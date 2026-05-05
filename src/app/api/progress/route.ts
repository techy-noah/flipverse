import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface ProgressRow {
  id: string;
  attempts: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { userId, questionId, deckId, status } = body;

    if (!userId || !questionId || !deckId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('user_progress')
      .select('id, attempts')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .limit(1);

    if (existing && existing.length > 0) {
      const row = existing[0] as ProgressRow;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('user_progress')
        .update({
          status,
          attempts: (row.attempts || 0) + 1,
          last_reviewed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('user_progress').insert({
        user_id: userId,
        question_id: questionId,
        deck_id: deckId,
        status,
        attempts: 1,
        last_reviewed: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    return NextResponse.json({ progress: data || [] });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
