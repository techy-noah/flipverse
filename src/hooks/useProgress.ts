'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressStatus } from '@/types';

const STORAGE_KEY = 'flipverse_progress';

interface ProgressData {
  [questionId: string]: {
    status: ProgressStatus;
    attempts: number;
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

  const saveProgress = useCallback((newProgress: ProgressData) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, status: ProgressStatus) => {
      setProgress((prev) => {
        const existing = prev[questionId];
        const updated = {
          ...prev,
          [questionId]: {
            status,
            attempts: (existing?.attempts || 0) + 1,
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
      .filter(([, data]) => data.status === 'didnt_know')
      .map(([id]) => id);
  }, [progress]);

  const getMastered = useCallback(() => {
    return Object.entries(progress)
      .filter(([, data]) => data.status === 'knew')
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
        else if (p.status === 'knew') mastered++;
        else learning++;
      });

      return { mastered, learning, new: newCards };
    },
    [progress]
  );

  return {
    progress,
    recordAnswer,
    getMistakes,
    getMastered,
    getDeckProgress,
  };
}
