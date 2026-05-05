'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, Header, FlipCard, ProgressBar } from '@/components';
import { Button } from '@/components/ui/Button';
import { getAllQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { Question, ProgressStatus, AnswerAction } from '@/types';

interface RetryRecord {
  questionId: string;
  correctCount: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const { getMistakes, recordAnswer, progress } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<RetryRecord[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const mistakeIds = getMistakes();
  const reviewQuestions = useMemo(
    () => allQuestions.filter((q) => mistakeIds.includes(q.id)),
    [allQuestions, mistakeIds]
  );

  const currentQuestion = reviewQuestions[currentIndex];
  const totalCards = reviewQuestions.length;

  const handleAnswer = useCallback(
    (action: AnswerAction) => {
      if (!currentQuestion || isTransitioning) return;

      const isCorrect = action === 'knew';
      const status: ProgressStatus = isCorrect ? 'knew' : 'didnt_know';

      recordAnswer(currentQuestion.id, status);

      const existingResult = results.find((r) => r.questionId === currentQuestion.id);
      const newCorrectCount = isCorrect ? (existingResult?.correctCount || 0) + 1 : 0;

      if (!existingResult) {
        setResults((prev) => [...prev, { questionId: currentQuestion.id, correctCount: newCorrectCount }]);
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.questionId === currentQuestion.id
              ? { ...r, correctCount: newCorrectCount }
              : r
          )
        );
      }

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
    [currentQuestion, currentIndex, totalCards, recordAnswer, results, isTransitioning]
  );

  const handleNavigate = useCallback((dir: 'next' | 'prev') => {
    if (isTransitioning) return;
    if (dir === 'next' && currentIndex < totalCards - 1) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentIndex((i) => i + 1); setIsTransitioning(false); }, 200);
    } else if (dir === 'prev' && currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentIndex((i) => i - 1); setIsTransitioning(false); }, 200);
    }
  }, [currentIndex, totalCards, isTransitioning]);

  if (totalCards === 0 && !completed) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Review Mistakes" />
        <div className="px-4 pt-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text mb-2">All Caught Up!</h2>
          <p className="text-sm text-text-secondary mb-6">
            No mistakes to review. You&apos;re doing great!
          </p>
          <Button onClick={() => router.push('/decks')}>Go to Decks</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (completed) {
    const masteredNow = results.filter((r) => r.correctCount >= 2).length;
    const stillLearning = results.filter((r) => r.correctCount < 2).length;

    return (
      <div className="min-h-screen pb-20">
        <Header title="Review Complete" />
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-surface rounded-xl border border-border p-6 text-center">
            <div className="text-4xl font-bold text-success mb-2">
              {masteredNow}/{totalCards}
            </div>
            <p className="text-text-secondary text-sm mb-6">
              {masteredNow === totalCards
                ? 'Perfect! All cards mastered!'
                : stillLearning > 0
                ? `${stillLearning} still need more practice`
                : 'Great progress!'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-success/10 rounded-xl p-3">
                <div className="text-xl font-bold text-success">{masteredNow}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Mastered</div>
              </div>
              <div className="bg-warning/10 rounded-xl p-3">
                <div className="text-xl font-bold text-warning">{stillLearning}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">Still Learning</div>
              </div>
            </div>

            <div className="space-y-2">
              {stillLearning > 0 && (
                <Button fullWidth onClick={() => { setCompleted(false); setCurrentIndex(0); setResults([]); }}>
                  Review Again
                </Button>
              )}
              <Button variant="secondary" fullWidth onClick={() => router.push('/decks')}>
                Back to Decks
              </Button>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Results</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((r) => {
                const q = reviewQuestions.find((q) => q.id === r.questionId);
                if (!q) return null;
                const isMastered = r.correctCount >= 2;
                return (
                  <div key={r.questionId} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isMastered ? 'bg-success/20' : 'bg-warning/20'}`}>
                      {isMastered ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary line-clamp-1">{q.question}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {isMastered ? 'Mastered (2 correct)' : `${r.correctCount}/2 correct`}
                      </p>
                    </div>
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

  return (
    <div className="min-h-screen pb-20">
      <Header title="Review Mistakes" />

      <div className="px-4 pt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-xs text-error">
              {totalCards - currentIndex} remaining
            </span>
          </div>
          <ProgressBar value={currentIndex + 1} max={totalCards} />
        </div>

        <div className="flex justify-center animate-fade-in" key={currentIndex}>
          <FlipCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={() => handleNavigate('next')}
            onPrev={() => handleNavigate('prev')}
            currentIndex={currentIndex}
            totalCards={totalCards}
          />
        </div>

        <div className="flex items-center justify-between px-2">
          <button onClick={() => handleNavigate('prev')} disabled={currentIndex === 0} className="p-2 rounded-lg text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          <span className="text-xs text-text-muted">Get 2 correct to master</span>
          <button onClick={() => handleNavigate('next')} disabled={currentIndex === totalCards - 1} className="p-2 rounded-lg text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
