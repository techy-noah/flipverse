'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FlipCard } from '@/components/FlipCard';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getQuestionsByDeck, getRandomQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { ProgressStatus } from '@/types';

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordAnswer } = useProgress();

  const deckId = searchParams.get('deck') || '';
  const mode = searchParams.get('mode') || 'all';

  const allQuestions = useMemo(
    () => getQuestionsByDeck(deckId),
    [deckId]
  );

  const quizQuestions = useMemo(() => {
    if (mode === 'daily') {
      return getRandomQuestions(10);
    }
    return allQuestions;
  }, [allQuestions, mode]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProgressStatus>>({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const totalCards = quizQuestions.length;

  const handleAnswer = useCallback(
    (status: ProgressStatus) => {
      if (!currentQuestion) return;

      recordAnswer(currentQuestion.id, status);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: status }));

      if (currentIndex < totalCards - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 200);
      } else {
        setCompleted(true);
      }
    },
    [currentQuestion, currentIndex, totalCards, recordAnswer]
  );

  if (completed) {
    const knewCount = Object.values(answers).filter(
      (s) => s === 'knew'
    ).length;
    const didntKnowCount = Object.values(answers).filter(
      (s) => s === 'didnt_know'
    ).length;
    const score = totalCards > 0 ? Math.round((knewCount / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen">
        <Header title="Quiz Complete" showBack />
        <div className="px-4 py-6">
          <div className="bg-surface rounded-xl border border-border p-6 text-center mb-4">
            <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
            <p className="text-text-secondary text-sm mb-6">
              {score >= 80
                ? 'Excellent! You know your Bible well!'
                : score >= 60
                ? 'Good job! Keep studying to improve.'
                : 'Keep learning! Review the cards you missed.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-success/10 rounded-lg p-3">
                <div className="text-lg font-semibold text-success">
                  {knewCount}
                </div>
                <div className="text-xs text-text-secondary">Got It</div>
              </div>
              <div className="bg-error/10 rounded-lg p-3">
                <div className="text-lg font-semibold text-error">
                  {didntKnowCount}
                </div>
                <div className="text-xs text-text-secondary">
                  Still Learning
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {didntKnowCount > 0 && (
                <Button
                  variant="error"
                  fullWidth
                  onClick={() => router.push('/review')}
                >
                  Review Mistakes
                </Button>
              )}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => router.push('/decks')}
              >
                Back to Decks
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen">
        <Header title="Quiz" showBack />
        <div className="px-4 py-8 text-center">
          <p className="text-text-secondary">No questions available.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push('/decks')}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Quiz" showBack />

      <div className="px-4 py-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-xs text-text-muted">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <ProgressBar value={currentIndex + 1} max={totalCards} />
        </div>

        <div className="mt-6">
          <FlipCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentIndex={currentIndex}
            totalCards={totalCards}
          />
        </div>

        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={() =>
              currentIndex > 0 && setCurrentIndex((i) => i - 1)
            }
            disabled={currentIndex === 0}
            className="p-2 rounded-lg text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous card"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          <span className="text-xs text-text-muted">
            Swipe or tap to navigate
          </span>

          <button
            onClick={() =>
              currentIndex < totalCards - 1 &&
              setCurrentIndex((i) => i + 1)
            }
            disabled={currentIndex === totalCards - 1}
            className="p-2 rounded-lg text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next card"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizLoading() {
  return (
    <div className="min-h-screen">
      <Header title="Quiz" showBack />
      <div className="px-4 py-12 text-center">
        <div className="text-text-secondary text-sm">Loading quiz...</div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizContent />
    </Suspense>
  );
}
