'use client';

import Link from 'next/link';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';

interface DeckCardData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  total_questions: number;
  mastered: number;
  learning: number;
  new: number;
}

interface DeckCardProps {
  deck: DeckCardData;
}

const iconMap: Record<string, string> = {
  book: '\uD83D\uDCD6',
  star: '\u2B50',
  message: '\uD83D\uDCAC',
  shield: '\uD83D\uDEE1\uFE0F',
  users: '\uD83D\uDC65',
  heart: '\u2764\uFE0F',
};

export function DeckCard({ deck }: DeckCardProps) {
  const progress = deck.total_questions > 0 ? (deck.mastered / deck.total_questions) * 100 : 0;
  const icon = iconMap[deck.icon || ''] || '\uD83D\uDCD6';

  return (
    <Link href={`/decks/${deck.id}`}>
      <Card className="p-4 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${deck.color}20` }}
          >
            <span className="text-lg" style={{ color: deck.color }}>
              {icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text truncate">{deck.name}</h3>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {deck.description}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-muted">
                  {deck.mastered}/{deck.total_questions} mastered
                </span>
                <span className="text-[10px] text-text-muted">
                  {Math.round(progress)}%
                </span>
              </div>
              <ProgressBar value={deck.mastered} max={deck.total_questions} />
            </div>

            <div className="flex items-center gap-2 mt-2">
              {deck.new > 0 && <Badge variant="default">{deck.new} new</Badge>}
              {deck.learning > 0 && <Badge variant="warning">{deck.learning} learning</Badge>}
              {deck.mastered > 0 && <Badge variant="success">{deck.mastered} done</Badge>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
