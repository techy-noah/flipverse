'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BottomNav, ProgressBar, StatCard } from '@/components';
import { decks } from '@/lib/data/decks';
import { getQuestionsByDeck, getRandomQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { Deck, Question } from '@/types';

function getGreeting(user: { email?: string } | null): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.email?.split('@')[0];
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

interface DeckWithProgress extends Deck {
  totalQuestions: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getDeckProgress, getMastered, getMistakes, progress } = useProgress();

  const decksWithProgress = useMemo((): DeckWithProgress[] => {
    return decks.map((deck) => {
      const questions = getQuestionsByDeck(deck.id);
      const questionIds = questions.map((q) => q.id);
      const p = getDeckProgress(questionIds);
      return {
        ...deck,
        totalQuestions: questions.length,
        masteredCount: p.mastered,
        learningCount: p.learning,
        newCount: p.new,
      };
    });
  }, [getDeckProgress]);

  const lastDeck = useMemo((): DeckWithProgress | null => {
    const answered = decksWithProgress.filter((d) => d.masteredCount + d.learningCount > 0);
    if (answered.length === 0) return null;
    return answered[answered.length - 1];
  }, [decksWithProgress]);

  const dailyQuestion = useMemo((): Question => {
    const [q] = getRandomQuestions(1);
    return q;
  }, []);

  const totalMastered = getMastered().length;
  const totalMistakes = getMistakes().length;
  const streak = Math.floor(totalMastered / 5);

  const quickActions = [
    {
      label: 'Random Quiz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          <path d="m14 14-5-5" />
        </svg>
      ),
      href: '/daily',
      color: 'text-warning',
      bg: 'bg-warning/15',
    },
    {
      label: `Mistakes${totalMistakes > 0 ? ` (${totalMistakes})` : ''}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      ),
      href: '/review',
      color: 'text-error',
      bg: 'bg-error/15',
    },
    {
      label: 'Browse Decks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
      href: '/decks',
      color: 'text-primary',
      bg: 'bg-primary/15',
    },
  ];

  const iconMap: Record<string, string> = {
    book: '📖',
    star: '⭐',
    message: '💬',
    shield: '🛡️',
    users: '👥',
    heart: '❤️',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">{getGreeting(user)}</p>
            <h1 className="text-xl font-bold text-text">FlipVerse</h1>
          </div>
          <div className="flex items-center gap-2 bg-surface rounded-xl border border-border px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-semibold text-text">{streak} day streak</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Continue Learning */}
        {lastDeck && (
          <section>
            <h2 className="text-sm font-semibold text-text mb-3">Continue Learning</h2>
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${lastDeck.color}20` }}
                >
                  <span className="text-lg">{iconMap[lastDeck.icon || ''] || '📖'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text truncate">{lastDeck.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {lastDeck.masteredCount}/{lastDeck.totalQuestions} mastered
                  </p>
                </div>
              </div>
              <ProgressBar value={lastDeck.masteredCount} max={lastDeck.totalQuestions} className="mb-3" />
              <Link
                href={`/decks/${lastDeck.id}`}
                className="block w-full h-10 bg-primary hover:bg-primary-hover active:bg-primary-hover text-white rounded-xl font-medium text-sm text-center leading-10 transition-colors"
              >
                Resume
              </Link>
            </div>
          </section>
        )}

        {/* Daily Challenge */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">Daily Challenge</h2>
            <span className="text-xs text-text-muted bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium">
              New
            </span>
          </div>
          <button
            onClick={() => router.push('/daily')}
            className="w-full bg-surface rounded-xl border border-border p-4 text-left hover:border-warning/30 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">Question of the day</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text leading-relaxed mb-2">
              {dailyQuestion.question}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">
                {dailyQuestion.reference}
              </span>
              <span className="text-[10px] text-text-muted">Tap to answer</span>
            </div>
          </button>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 bg-surface rounded-xl border border-border p-4 hover:border-primary/30 active:scale-[0.96] transition-all"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg}`}>
                  <span className={action.color}>{action.icon}</span>
                </div>
                <span className="text-xs text-text-secondary font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">Your Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              item={{ label: 'Mastered', value: totalMastered, color: 'success' }}
              compact
            />
            <button
              onClick={() => totalMistakes > 0 && router.push('/review')}
              disabled={totalMistakes === 0}
              className="text-left"
            >
              <StatCard
                item={{ label: 'To Review', value: totalMistakes, color: 'error' }}
                compact
              />
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
