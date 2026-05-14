'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, BottomNav, ProgressBar } from '@/components';
import { decks } from '@/lib/data/decks';
import { getQuestionsByDeck } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';

const iconMap: Record<string, string> = {
  book: '📖',
  star: '⭐',
  message: '💬',
  shield: '🛡️',
  users: '👥',
  heart: '❤️',
};

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getDeckProgress, progress } = useProgress();
  const deckId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const deck = useMemo(() => decks.find((d) => d.id === deckId), [deckId]);
  const questions = useMemo(() => {
    const qs = getQuestionsByDeck(deckId);
    return [...qs].sort(() => Math.random() - 0.5);
  }, [deckId]);

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const deckProgress = getDeckProgress(questionIds);

  const mistakeCount = useMemo(() => {
    return questionIds.filter((id) => {
      const p = progress[id];
      return p && p.status === 'learning' && p.wrongCount > p.correctCount;
    }).length;
  }, [questionIds, progress]);

  const totalProgress = questions.length > 0 ? (deckProgress.mastered / questions.length) * 100 : 0;

  if (!deck) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Deck Not Found" showBack />
        <div className="px-4 py-12 text-center">
          <p className="text-text-secondary text-sm">This deck does not exist.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleStart = () => {
    router.push(`/quiz?deck=${deckId}&mode=shuffle`);
  };

  const btnBase = 'w-full rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]';

  return (
    <div className="min-h-screen pb-20">
      <Header title={deck.name} showBack />

      <div className="px-4 pt-4 space-y-4">
        {/* Deck Header */}
        <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${deck.color}20` }}
                >
                  <span className="text-2xl">{iconMap[deck.icon || ''] || '📖'}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-text">{deck.name}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {deck.description || 'No description'}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">Progress</span>
                  <span className="text-xs text-text-muted">
                    {Math.round(totalProgress)}%
                  </span>
                </div>
                <ProgressBar value={deckProgress.mastered} max={questions.length} />
              </div>

              <div className="flex items-center gap-2">
                {deckProgress.new > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-light text-primary">
                    {deckProgress.new} new
                  </span>
                )}
                {deckProgress.learning > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/15 text-warning">
                    {deckProgress.learning} learning
                  </span>
                )}
                {deckProgress.mastered > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-light text-success">
                    {deckProgress.mastered} mastered
                  </span>
                )}
              </div>
            </div>

            {/* Start Controls */}
            <div className="bg-surface rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-3">Start Quiz</h3>

              <div className="space-y-2">
                <button
                  onClick={handleStart}
                  className={`${btnBase} h-12 bg-primary hover:bg-primary-hover active:bg-primary-hover text-white flex items-center justify-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start ({questions.length} cards)
                </button>

                {deckProgress.learning > 0 && (
                  <button
                    onClick={() => router.push(`/quiz?deck=${deckId}&mode=learning`)}
                    className={`${btnBase} h-10 bg-surface-elevated hover:bg-border text-text-secondary hover:text-text border border-border`}
                  >
                    Review Learning ({deckProgress.learning})
                  </button>
                )}

                {mistakeCount > 0 && (
                  <button
                    onClick={() => router.push('/review')}
                    className={`${btnBase} h-10 bg-error/10 hover:bg-error/15 text-error border border-error/20 flex items-center justify-center gap-2`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    Review Mistakes ({mistakeCount})
                  </button>
                )}

                {deckProgress.new > 0 && (
                  <button
                    onClick={() => router.push(`/quiz?deck=${deckId}&mode=new`)}
                    className={`${btnBase} h-10 bg-surface-elevated hover:bg-border text-text-secondary hover:text-text border border-border`}
                  >
                    New Cards Only ({deckProgress.new})
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="bg-surface rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-text mb-3">
                All Questions ({questions.length})
              </h3>
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const qProgress = progress[q.id];
                  const statusColor =
                    qProgress?.status === 'mastered'
                      ? 'border-l-success'
                      : qProgress?.status === 'learning'
                      ? 'border-l-error'
                      : 'border-l-transparent';
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 py-2 border-b border-border last:border-b-0 border-l-2 ${statusColor}`}
                    >
                      <span className="text-xs text-text-muted flex-shrink-0 w-5 text-right">
                        {i + 1}
                      </span>
                      <p className="text-xs text-text-secondary line-clamp-2 flex-1">
                        {q.question}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
      </div>

      <BottomNav />
    </div>
  );
}
