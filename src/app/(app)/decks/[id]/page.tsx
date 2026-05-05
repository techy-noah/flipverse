'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { decks as allDecks } from '@/lib/data/decks';
import { getQuestionsByDeck } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getDeckProgress } = useProgress();
  const deckId = params.id as string;

  const deck = useMemo(() => allDecks.find((d) => d.id === deckId), [deckId]);
  const questions = useMemo(() => getQuestionsByDeck(deckId), [deckId]);

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const progress = useProgress().getDeckProgress(questionIds);

  if (!deck) {
    return (
      <div className="min-h-screen">
        <Header title="Deck Not Found" showBack />
        <div className="px-4 py-8 text-center">
          <p className="text-text-secondary">This deck does not exist.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const totalProgress =
    questions.length > 0 ? (progress.mastered / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen">
      <Header title={deck.name} showBack />

      <div className="px-4 py-4">
        <div className="bg-surface rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${deck.color}20` }}
            >
              <span className="text-2xl" style={{ color: deck.color }}>
                {deck.icon === 'book' && '\uD83D\uDCD6'}
                {deck.icon === 'star' && '\u2B50'}
                {deck.icon === 'message' && '\uD83D\uDCAC'}
                {deck.icon === 'shield' && '\uD83D\uDEE1\uFE0F'}
                {deck.icon === 'users' && '\uD83D\uDC65'}
                {deck.icon === 'heart' && '\u2764\uFE0F'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">{deck.name}</h2>
              <p className="text-xs text-text-secondary">{deck.description}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Progress</span>
              <span className="text-xs text-text-muted">
                {Math.round(totalProgress)}%
              </span>
            </div>
            <ProgressBar value={progress.mastered} max={questions.length} />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">{progress.new} new</Badge>
            <Badge variant="warning">{progress.learning} learning</Badge>
            <Badge variant="success">{progress.mastered} mastered</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push(`/quiz?deck=${deckId}&mode=all`)}
          >
            Start Quiz ({questions.length} cards)
          </Button>

          {progress.learning > 0 && (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/quiz?deck=${deckId}&mode=learning`)}
            >
              Review Learning ({progress.learning})
            </Button>
          )}

          {progress.new > 0 && (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/quiz?deck=${deckId}&mode=new`)}
            >
              New Cards ({progress.new})
            </Button>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text mb-3">
            All Questions ({questions.length})
          </h3>
          <div className="space-y-2">
            {questions.slice(0, 10).map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 py-2 border-b border-border last:border-b-0"
              >
                <span className="text-xs text-text-muted flex-shrink-0 w-5">
                  {i + 1}
                </span>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {q.question}
                </p>
              </div>
            ))}
            {questions.length > 10 && (
              <p className="text-xs text-text-muted text-center pt-2">
                +{questions.length - 10} more questions
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
