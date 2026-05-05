'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, Header, FlipCard, ProgressBar } from '@/components';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getRandomQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { ProgressStatus, AnswerAction } from '@/types';

const DAILY_QUESTION_COUNT = 5;

export default function DailyPage() {
  const router = useRouter();
  const { recordAnswer } = useProgress();

  const [dailyQuestions] = useState(() => getRandomQuestions(DAILY_QUESTION_COUNT));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ProgressStatus[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = dailyQuestions[currentIndex];
  const totalCards = dailyQuestions.length;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleAnswer = useCallback(
    (action: AnswerAction) => {
      if (!currentQuestion || isTransitioning) return;
      const status: ProgressStatus = action === 'knew' ? 'knew' : 'didnt_know';

      recordAnswer(currentQuestion.id, status);
      setAnswers((prev) => [...prev, status]);

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

  if (completed) {
    const knewCount = answers.filter((s) => s === 'knew').length;
    const score = Math.round((knewCount / totalCards) * 100);

    return (
      <div className="min-h-screen pb-20">
        <Header title="Daily Challenge" />
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-surface rounded-xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-2">{score}%</div>
            <p className="text-text-secondary text-sm mb-6">Today&apos;s Score</p>

            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(totalCards)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={i < knewCount ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={i < knewCount ? 'text-warning' : 'text-text-muted'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            <div className="space-y-2">
              <Button fullWidth onClick={() => router.push('/decks')}>Continue Learning</Button>
              <Button variant="secondary" fullWidth onClick={() => router.push('/review')}>Review Mistakes</Button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="Daily Challenge" />

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-text">{formattedDate}</h2>
              <p className="text-xs text-text-secondary">{DAILY_QUESTION_COUNT} questions</p>
            </div>
            <Badge variant="warning">Daily</Badge>
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
          <span className="text-xs text-text-muted">Daily Challenge</span>
          <button onClick={() => handleNavigate('next')} disabled={currentIndex === totalCards - 1} className="p-2 rounded-lg text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
