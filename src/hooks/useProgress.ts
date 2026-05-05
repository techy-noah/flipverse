'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressStatus } from '@/types';

const STORAGE_KEY = 'flipverse_progress';

interface ProgressData {
  [questionId: string]: {
    status: ProgressStatus;
    attempts: number;
    correctStreak: number;
    wrongCount: number;
    correctCount: number;
    lastReviewed: string;
  };
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch {
      setProgress({});
    }
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, status: ProgressStatus) => {
      setProgress((prev) => {
        const existing = prev[questionId] || {
          status: 'new' as ProgressStatus,
          attempts: 0,
          correctStreak: 0,
          wrongCount: 0,
          correctCount: 0,
          lastReviewed: '',
        };

        let newStatus = status;
        let newStreak = existing.correctStreak;
        let newCorrectCount = existing.correctCount;
        let newWrongCount = existing.wrongCount;

        if (status === 'knew') {
          newStreak += 1;
          newCorrectCount += 1;
          if (newStreak >= 2) {
            newStatus = 'mastered';
          } else {
            newStatus = 'learning';
          }
        } else {
          newStreak = 0;
          newWrongCount += 1;
          newStatus = 'learning';
        }

        const updated = {
          ...prev,
          [questionId]: {
            status: newStatus,
            attempts: existing.attempts + 1,
            correctStreak: newStreak,
            correctCount: newCorrectCount,
            wrongCount: newWrongCount,
            lastReviewed: new Date().toISOString(),
          },
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const getMistakes = useCallback(() => {
    return Object.entries(progress)
      .filter(([, data]) => data.status === 'learning' && data.wrongCount > data.correctCount)
      .map(([id]) => id);
  }, [progress]);

  const getMastered = useCallback(() => {
    return Object.entries(progress)
      .filter(([, data]) => data.status === 'mastered' || data.correctStreak >= 2)
      .map(([id]) => id);
  }, [progress]);

  const getReviewQueue = useCallback(() => {
    return Object.entries(progress)
      .filter(([, data]) => data.status === 'learning')
      .sort(([, a], [, b]) => {
        if (a.wrongCount !== b.wrongCount) return b.wrongCount - a.wrongCount;
        return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
      })
      .map(([id]) => id);
  }, [progress]);

  const getDeckProgress = useCallback(
    (questionIds: string[]) => {
      let mastered = 0;
      let learning = 0;
      let newCards = 0;

      questionIds.forEach((id) => {
        const p = progress[id];
        if (!p || p.status === 'new') newCards++;
        else if (p.status === 'mastered' || p.correctStreak >= 2) mastered++;
        else learning++;
      });

      return { mastered, learning, new: newCards };
    },
    [progress]
  );

  const getStats = useCallback(() => {
    const entries = Object.values(progress);
    return {
      total: entries.length,
      mastered: entries.filter((e) => e.status === 'mastered' || e.correctStreak >= 2).length,
      learning: entries.filter((e) => e.status === 'learning').length,
      totalCorrect: entries.reduce((sum, e) => sum + e.correctCount, 0),
      totalWrong: entries.reduce((sum, e) => sum + e.wrongCount, 0),
    };
  }, [progress]);

  return {
    progress,
    recordAnswer,
    getMistakes,
    getMastered,
    getReviewQueue,
    getDeckProgress,
    getStats,
  };
}
