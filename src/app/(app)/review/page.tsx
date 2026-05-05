'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { FlipCard } from '@/components/FlipCard';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getAllQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { Question, ProgressStatus } from '@/types';

export default function ReviewPage() {
  const router = useRouter();
  const { getMistakes, recordAnswer } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProgressStatus>>({});
  const [completed, setCompleted] = useState(false);

  const mistakeIds = getMistakes();
  const allQuestions = useMemo(() => getAllQuestions(), []);

  const reviewQuestions = useMemo(
    () => allQuestions.filter((q) => mistakeIds.includes(q.id)),
    [allQuestions, mistakeIds]
  );

  const currentQuestion = reviewQuestions[currentIndex];
  const totalCards = reviewQuestions.length;

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

  if (totalCards === 0 && !completed) {
    return (
      <div className="min-h-screen">
        <Header title="Review Mistakes" />
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text mb-2">
            No Mistakes to Review
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {Object.keys(answers).length > 0
              ? 'Great job! You reviewed all your mistakes.'
              : 'You have no recorded mistakes yet. Start quizzing to build your review list.'}
          </p>
          <Button onClick={() => router.push('/decks')}>Go to Decks</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (completed) {
    const improvedCount = Object.values(answers).filter(
      (s) => s === 'knew'
    ).length;
    const stillLearningCount = Object.values(answers).filter(
      (s) => s === 'didnt_know'
    ).length;

    return (
      <div className="min-h-screen">
        <Header title="Review Complete" />
        <div className="px-4 py-6">
          <div className="bg-surface rounded-xl border border-border p-6 text-center mb-4">
            <div className="text-4xl font-bold text-success mb-2">
              {improvedCount}/{totalCards}
            </div>
            <p className="text-text-secondary text-sm mb-6">
              {improvedCount === totalCards
                ? 'Perfect! You mastered all of them!'
                : stillLearningCount > 0
                ? `Still ${stillLearningCount} to review. Keep going!`
                : 'Great progress!'}
            </p>

            <div className="flex flex-col gap-2">
              {stillLearningCount > 0 && (
                <Button
                  variant="error"
                  fullWidth
                  onClick={() => {
                    setCompleted(false);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}
                >
                  Review Again
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
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Review Mistakes" />

      <div className="px-4 py-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-xs text-error">
              {totalCards - currentIndex} remaining
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
            Tap to flip, swipe to skip
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

      <BottomNav />
    </div>
  );
}
