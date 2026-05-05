'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, Header, ProgressBar, StatCard } from '@/components';
import { Button } from '@/components/ui/Button';
import { getAllQuestions } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  color: 'primary' | 'success' | 'warning' | 'error';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { progress, getMistakes, getMastered, getStats } = useProgress();

  const initials = useMemo(() => {
    if (!user?.email) return 'GU';
    return user.email.substring(0, 2).toUpperCase();
  }, [user?.email]);

  const displayName = useMemo(() => {
    if (!user?.email) return 'Guest User';
    return user.email.split('@')[0];
  }, [user?.email]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const stats = getStats();
  const totalAnswered = stats.totalCorrect + stats.totalWrong;
  const accuracy = totalAnswered > 0 ? Math.round((stats.totalCorrect / totalAnswered) * 100) : 0;
  const streak = useMemo(() => {
    const entries = Object.values(progress);
    if (entries.length === 0) return 0;
    return Math.floor(stats.mastered / 3);
  }, [progress, stats.mastered]);

  const achievements = useMemo((): Achievement[] => {
    const list: Achievement[] = [
      {
        id: 'first_answer',
        title: 'First Steps',
        description: 'Answer your first question',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        unlocked: totalAnswered >= 1,
        color: 'success',
      },
      {
        id: 'ten_answered',
        title: 'Getting Started',
        description: 'Answer 10 questions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
        unlocked: totalAnswered >= 10,
        color: 'primary',
      },
      {
        id: 'fifty_answered',
        title: 'Dedicated Learner',
        description: 'Answer 50 questions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        unlocked: totalAnswered >= 50,
        color: 'warning',
      },
      {
        id: 'hundred_answered',
        title: 'Century Club',
        description: 'Answer 100 questions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 4c3-3 5-1 7.5-1a2.5 2.5 0 0 1 0 5H18" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 7 12 4c-3-3-5-1-7.5-1a2.5 2.5 0 0 0 0 5H6" />
            <path d="M4 22h16" />
            <path d="M6 14h12" />
          </svg>
        ),
        unlocked: totalAnswered >= 100,
        color: 'warning',
      },
      {
        id: 'streak_3',
        title: 'On a Roll',
        description: '3 day streak',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        ),
        unlocked: streak >= 3,
        color: 'error',
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7 day streak',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </svg>
        ),
        unlocked: streak >= 7,
        color: 'error',
      },
      {
        id: 'perfect_accuracy',
        title: 'Sharp Shooter',
        description: '90% accuracy (min 20)',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        ),
        unlocked: accuracy >= 90 && totalAnswered >= 20,
        color: 'success',
      },
      {
        id: 'master_10',
        title: 'Master Mind',
        description: 'Master 10 questions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="m12 12 4 4" />
          </svg>
        ),
        unlocked: stats.mastered >= 10,
        color: 'primary',
      },
    ];

    return list;
  }, [totalAnswered, streak, accuracy, stats.mastered]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen pb-20">
      <Header title="Profile" />

      <div className="px-4 py-4 space-y-4 max-w-[360px] mx-auto">
        {/* User Info */}
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>
          <h2 className="text-base font-semibold text-text">{displayName}</h2>
          {user ? (
            <p className="text-xs text-text-secondary mt-1">
              {user.email}
            </p>
          ) : (
            <p className="text-xs text-text-secondary mt-1">
              Sign in to sync progress across devices
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            item={{ label: 'Answered', value: totalAnswered, color: 'primary' }}
            compact
          />
          <StatCard
            item={{ label: 'Accuracy', value: `${accuracy}%`, color: 'success' }}
            compact
          />
          <StatCard
            item={{ label: 'Streak', value: `${streak}d`, color: 'warning' }}
            compact
          />
        </div>

        {/* Overall Progress */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text">Overall Mastery</h3>
            <span className="text-xs text-text-muted">{stats.mastered}/{allQuestions.length}</span>
          </div>
          <ProgressBar value={stats.mastered} max={allQuestions.length} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-success">{stats.mastered} mastered</span>
            <span className="text-[10px] text-warning">{stats.learning} learning</span>
            <span className="text-[10px] text-text-muted">{stats.total - stats.mastered - stats.learning} new</span>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Achievements</h3>
            <span className="text-xs text-text-muted">{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border p-3 text-center transition-all ${
                  a.unlocked
                    ? 'bg-surface border-border'
                    : 'bg-surface/50 border-border/50 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  a.unlocked
                    ? a.color === 'success' ? 'bg-success/15 text-success'
                    : a.color === 'warning' ? 'bg-warning/15 text-warning'
                    : a.color === 'error' ? 'bg-error/15 text-error'
                    : 'bg-primary/15 text-primary'
                    : 'bg-border/30 text-text-muted'
                }`}>
                  {a.icon}
                </div>
                <p className="text-xs font-semibold text-text mb-0.5">{a.title}</p>
                <p className="text-[10px] text-text-secondary">{a.description}</p>
                {a.unlocked && (
                  <span className="inline-block mt-1.5 text-[9px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                    Unlocked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {stats.learning > 0 && (
            <Button variant="error" fullWidth onClick={() => router.push('/review')}>
              Review Mistakes ({stats.learning})
            </Button>
          )}
          {user ? (
            <Button variant="secondary" fullWidth onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => router.push('/login')}>
              Sign In
            </Button>
          )}
        </div>

        <div className="text-center pt-2">
          <p className="text-[10px] text-text-muted">FlipVerse v1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
