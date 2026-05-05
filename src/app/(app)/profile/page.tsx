'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { decks as allDecks } from '@/lib/data/decks';
import { getAllQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';

export default function ProfilePage() {
  const router = useRouter();
  const { progress, getMistakes, getMastered } = useProgress();

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const totalQuestions = allQuestions.length;
  const masteredCount = getMastered().length;
  const mistakesCount = getMistakes().length;
  const overallProgress =
    totalQuestions > 0 ? (masteredCount / totalQuestions) * 100 : 0;

  const deckStats = useMemo(() => {
    return allDecks.map((deck) => {
      const deckQuestions = allQuestions.filter(
        (q) => q.deck_id === deck.id
      );
      const deckQuestionIds = deckQuestions.map((q) => q.id);
      let mastered = 0;
      deckQuestionIds.forEach((id) => {
        if (progress[id]?.status === 'knew') mastered++;
      });
      return {
        name: deck.name,
        color: deck.color,
        mastered,
        total: deckQuestions.length,
      };
    });
  }, [progress, allQuestions]);

  return (
    <div className="min-h-screen">
      <Header title="Profile" />

      <div className="px-4 py-4">
        <div className="bg-surface rounded-xl border border-border p-4 mb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/15 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text">Guest User</h2>
          <p className="text-xs text-text-secondary mt-1">
            Sign in to sync progress across devices
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-text">{totalQuestions}</div>
            <div className="text-[10px] text-text-secondary mt-0.5">
              Total Cards
            </div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-success">
              {masteredCount}
            </div>
            <div className="text-[10px] text-text-secondary mt-0.5">
              Mastered
            </div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-error">
              {mistakesCount}
            </div>
            <div className="text-[10px] text-text-secondary mt-0.5">
              To Review
            </div>
          </Card>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text">
              Overall Progress
            </h3>
            <span className="text-xs text-text-muted">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <ProgressBar value={masteredCount} max={totalQuestions} />
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 mb-4">
          <h3 className="text-sm font-semibold text-text mb-3">
            Deck Progress
          </h3>
          <div className="space-y-3">
            {deckStats.map((stat) => (
              <div key={stat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-xs text-text-secondary">
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {stat.mastered}/{stat.total}
                  </span>
                </div>
                <ProgressBar value={stat.mastered} max={stat.total} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {mistakesCount > 0 && (
            <Button
              variant="error"
              fullWidth
              onClick={() => router.push('/review')}
            >
              Review Mistakes ({mistakesCount})
            </Button>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-text-muted">
            FlipVerse v1.0.0 - Bible Quiz App
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
