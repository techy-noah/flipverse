import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface DailyChallengeData {
  completed_by: string[];
}

export async function GET() {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', today)
      .limit(1);

    const challenge = data && data.length > 0 ? data[0] : null;

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Daily API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily challenge' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { userId, completed } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_challenges')
      .select('completed_by')
      .eq('date', today)
      .limit(1);

    const challenge = (data?.[0] || null) as DailyChallengeData | null;

    if (challenge && completed) {
      const completedBy = challenge.completed_by || [];
      if (!completedBy.includes(userId)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('daily_challenges')
          .update({
            completed_by: [...completedBy, userId],
          })
          .eq('date', today);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Daily API error:', error);
    return NextResponse.json(
      { error: 'Failed to update daily challenge' },
      { status: 500 }
    );
  }
}
