import { supabase } from './supabase';
import { Question } from '@/types';

export async function fetchMistakesFromDb(userId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      questions (*)
    `)
    .eq('user_id', userId)
    .gt('wrong_count', 'correct_count')
    .order('wrong_count', { ascending: false });

  if (error) {
    console.error('Failed to fetch mistakes:', error);
    return [];
  }

  return (data as unknown as Array<{ questions: Question | null }>)
    .filter((row) => row.questions)
    .map((row) => row.questions as Question);
}

export async function fetchDueForReview(userId: string, limit = 20): Promise<Question[]> {
  const { data, error } = await (supabase.rpc as Function)('get_due_questions', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error('Failed to fetch due questions:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.question_id as string,
    question: row.question as string,
    answer: row.answer as string,
    reference: row.reference as string,
    book: row.book as string,
    category: row.category as string,
    difficulty: row.difficulty as number,
    explanation: row.explanation as string,
  })) as Question[];
}

export async function updateProgressInDb(userId: string, questionId: string, deckId: string, wasCorrect: boolean) {
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id, correct_count, wrong_count')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  const existingTyped = existing as { id: string; correct_count: number; wrong_count: number } | null;

  if (existingTyped) {
    const updates: Record<string, unknown> = {
      last_reviewed: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (wasCorrect) {
      updates.correct_count = (existingTyped.correct_count || 0) + 1;
      if ((existingTyped.correct_count || 0) + 1 > (existingTyped.wrong_count || 0) + 1) {
        updates.status = 'mastered';
      } else {
        updates.status = 'learning';
      }
    } else {
      updates.wrong_count = (existingTyped.wrong_count || 0) + 1;
      updates.status = 'learning';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('user_progress').update(updates).eq('id', existingTyped.id);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('user_progress').insert({
      user_id: userId,
      question_id: questionId,
      deck_id: deckId,
      status: 'learning',
      correct_count: wasCorrect ? 1 : 0,
      wrong_count: wasCorrect ? 0 : 1,
      last_reviewed: new Date().toISOString(),
    });
  }
}
