'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { FlipCard } from '@/components/FlipCard';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { getRandomQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { ProgressStatus } from '@/types';

const DAILY_QUESTION_COUNT = 5;

export default function DailyPage() {
  const router = useRouter();
  const { recordAnswer } = useProgress();

  const [dailyQuestions] = useState(() => getRandomQuestions(DAILY_QUESTION_COUNT));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProgressStatus>>({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = dailyQuestions[currentIndex];
  const totalCards = dailyQuestions.length;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
    const score = Math.round((knewCount / totalCards) * 100);

    return (
      <div className="min-h-screen">
        <Header title="Daily Challenge" />
        <div className="px-4 py-6">
          <div className="bg-surface rounded-xl border border-border p-6 text-center mb-4">
            <div className="text-3xl font-bold text-warning mb-1">
              {score}/{totalCards}
            </div>
            <p className="text-text-secondary text-sm mb-2">
              Today\'s Score
            </p>
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(totalCards)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={i < knewCount ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    i < knewCount ? 'text-warning' : 'text-text-muted'
                  }
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push('/decks')}>
                Continue Learning
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/review')}
              >
                Review Mistakes
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
      <Header title="Daily Challenge" />

      <div className="px-4 py-4">
        <div className="bg-surface rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-text">
                {formattedDate}
              </h2>
              <p className="text-xs text-text-secondary">
                {DAILY_QUESTION_COUNT} questions to test your knowledge
              </p>
            </div>
            <Badge variant="warning">Daily</Badge>
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
            Daily Challenge
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
