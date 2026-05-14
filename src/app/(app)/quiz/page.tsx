'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, ProgressBar, BottomNav } from '@/components';
import { FlipCard } from '@/components/FlipCard';
import { Button } from '@/components/ui/Button';
import { getQuestionsByDeck, getRandomQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { Question, ProgressStatus, AnswerAction } from '@/types';

interface AnswerRecord {
  questionId: string;
  status: ProgressStatus;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordAnswer, progress } = useProgress();

  const deckId = searchParams.get('deck') || '';
  const mode = searchParams.get('mode') || 'all';

  const allQuestions = useMemo(
    () => getQuestionsByDeck(deckId),
    [deckId]
  );

  const quizQuestions = useMemo(() => {
    let filtered: Question[];
    if (mode === 'daily') {
      return getRandomQuestions(10);
    }
    if (mode === 'shuffle' || mode === 'all') {
      filtered = [...allQuestions];
    } else if (mode === 'learning') {
      filtered = allQuestions.filter((q) => progress[q.id]?.status === 'learning');
    } else if (mode === 'new') {
      filtered = allQuestions.filter((q) => !progress[q.id] || progress[q.id]?.status === 'new');
    } else {
      filtered = [...allQuestions];
    }
    return filtered.sort(() => Math.random() - 0.5);
  }, [allQuestions, mode, progress]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const totalCards = quizQuestions.length;
  const answeredCount = answers.length;

  const handleNavigate = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    if (direction === 'next' && currentIndex < totalCards - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
      }, 200);
    } else if (direction === 'prev' && currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i - 1);
        setIsTransitioning(false);
      }, 200);
    }
  }, [currentIndex, totalCards, isTransitioning]);

  const handleAnswer = useCallback(
    (action: AnswerAction) => {
      if (!currentQuestion || isTransitioning) return;

      const status: ProgressStatus = action === 'knew' ? 'knew' : 'didnt_know';

      recordAnswer(currentQuestion.id, status);
      setAnswers((prev) => [
        ...prev,
        { questionId: currentQuestion.id, status },
      ]);

      if (currentIndex < totalCards - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setIsTransitioning(false);
        }, 300);
      } else {
        setCompleted(true);
      }
    },
    [currentQuestion, currentIndex, totalCards, recordAnswer, isTransitioning]
  );

  if (completed) {
    const knewCount = answers.filter((a) => a.status === 'knew').length;
    const didntKnowCount = answers.filter((a) => a.status === 'didnt_know').length;
    const score = totalCards > 0 ? Math.round((knewCount / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen pb-20">
        <Header title="Session Complete" />

        <div className="px-4 pt-4 space-y-4">
          {/* Score Card */}
          <div className="bg-surface rounded-xl border border-border p-6 text-center">
            <div
              className={`text-5xl font-bold mb-2 ${
                score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'
              }`}
            >
              {score}%
            </div>
            <p className="text-sm text-text-secondary mb-6">
              {score >= 80
                ? 'Excellent! You know your Bible well!'
                : score >= 60
                ? 'Good job! Keep studying to improve.'
                : 'Keep learning! Review the cards you missed.'}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-primary/10 rounded-xl p-3">
                <div className="text-xl font-bold text-primary">{totalCards}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Total</div>
              </div>
              <div className="bg-success/10 rounded-xl p-3">
                <div className="text-xl font-bold text-success">{knewCount}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Correct</div>
              </div>
              <div className="bg-error/10 rounded-xl p-3">
                <div className="text-xl font-bold text-error">{didntKnowCount}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Wrong</div>
              </div>
            </div>

            {/* Accuracy Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">Accuracy</span>
                <span className="text-xs text-text-muted">{score}%</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Breakdown</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {answers.map((a, i) => {
                const q = quizQuestions.find((q) => q.id === a.questionId);
                if (!q) return null;
                return (
                  <div
                    key={a.questionId}
                    className="flex items-start gap-3 py-2 border-b border-border last:border-b-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        a.status === 'knew' ? 'bg-success/20' : 'bg-error/20'
                      }`}
                    >
                      {a.status === 'knew' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary line-clamp-1">{q.question}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{q.answer}</p>
                      {q.reference && (
                        <p className="text-[10px] text-primary mt-0.5">{q.reference}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {didntKnowCount > 0 && (
              <Button
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
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Quiz" showBack />
        <div className="px-4 pt-8 text-center">
          <p className="text-text-secondary text-sm">No questions available for this deck.</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push('/decks')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="Quiz" showBack />

      <div className="px-4 pt-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-xs text-text-muted">
              {answeredCount}/{totalCards} answered
            </span>
          </div>
          <ProgressBar value={answeredCount} max={totalCards} />
        </div>

        {/* Flip Card */}
        <div
          className="flex justify-center animate-fade-in"
          key={currentIndex}
        >
          <FlipCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={() => handleNavigate('next')}
            onPrev={() => handleNavigate('prev')}
            currentIndex={currentIndex}
            totalCards={totalCards}
          />
        </div>

        {/* Navigation Hints */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => handleNavigate('prev')}
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
            onClick={() => handleNavigate('next')}
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
    <div className="min-h-screen pb-20">
      <Header title="Quiz" showBack />
      <div className="px-4 pt-12 text-center">
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
