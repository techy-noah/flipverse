'use client';

import Link from 'next/link';
import { Deck } from '@/types';
import { ProgressBar } from './ProgressBar';

interface DeckCardProps {
  deck: Deck;
}

const iconMap: Record<string, string> = {
  book: '📖',
  star: '⭐',
  message: '💬',
  shield: '🛡️',
  users: '👥',
  heart: '❤️',
};

export function DeckCard({ deck }: DeckCardProps) {
  const total = deck.totalQuestions || 0;
  const mastered = deck.masteredCount || 0;
  const learning = deck.learningCount || 0;
  const newCount = deck.newCount || 0;
  const progress = total > 0 ? (mastered / total) * 100 : 0;
  const icon = iconMap[deck.icon || ''] || '📖';

  return (
    <Link href={`/decks/${deck.id}`}>
      <div className="bg-surface rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${deck.color}20` }}
          >
            <span className="text-lg">{icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text truncate">{deck.name}</h3>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {deck.description || 'No description'}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-muted">
                  {mastered}/{total} mastered
                </span>
                <span className="text-[10px] text-text-muted">{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={mastered} max={total} />
            </div>

            <div className="flex items-center gap-2 mt-2">
              {newCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-light text-primary">
                  {newCount} new
                </span>
              )}
              {learning > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/15 text-warning">
                  {learning} learning
                </span>
              )}
              {mastered > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-light text-success">
                  {mastered} done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
