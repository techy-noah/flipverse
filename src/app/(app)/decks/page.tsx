'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BottomNav, Header, ProgressBar } from '@/components';
import { LazySection } from '@/components/Lazy';
import { decks, categories } from '@/lib/data/decks';
import { getQuestionsByDeck } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';
import { Deck } from '@/types';

const iconMap: Record<string, string> = {
  book: '📖',
  star: '⭐',
  message: '💬',
  shield: '🛡️',
  users: '👥',
  heart: '❤️',
  grid: '📚',
};

interface DeckWithProgress extends Deck {
  totalQuestions: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
}

export default function DecksPage() {
  const router = useRouter();
  const { getDeckProgress } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const filteredDecks = useMemo(() => {
    let result = decksWithProgress;

    if (activeCategory !== 'all') {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [decksWithProgress, activeCategory, searchQuery]);

  const handleCategoryChange = useCallback((catId: string) => {
    setActiveCategory(catId);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Decks" />

      <div className="px-4 pt-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="-mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150 active:scale-95 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary/30'
                  }`}
                >
                  <span className="text-sm">{iconMap[cat.icon || ''] || '📖'}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck List */}
        <div className="flex flex-col gap-3">
            {filteredDecks.map((deck, index) => {
              const progress = deck.totalQuestions > 0 ? (deck.masteredCount / deck.totalQuestions) * 100 : 0;
              return (
                <LazySection key={deck.id} rootMargin={`${index * 50}px`}>
                  <Link
                    href={`/decks/${deck.id}`}
                    className="block bg-surface rounded-xl border border-border p-4 hover:border-primary/30 active:scale-[0.98] transition-all duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${deck.color}20` }}
                      >
                        <span className="text-lg">{iconMap[deck.icon || ''] || '📖'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-text truncate">{deck.name}</h3>
                          <span className="text-[10px] text-text-muted flex-shrink-0 ml-2">
                            {deck.totalQuestions} cards
                          </span>
                        </div>

                        {deck.description && (
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                            {deck.description}
                          </p>
                        )}

                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-text-muted">
                              {deck.masteredCount}/{deck.totalQuestions} mastered
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <ProgressBar value={deck.masteredCount} max={deck.totalQuestions} />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {deck.newCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-light text-primary">
                              {deck.newCount} new
                            </span>
                          )}
                          {deck.learningCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/15 text-warning">
                              {deck.learningCount} learning
                            </span>
                          )}
                          {deck.masteredCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-light text-success">
                              {deck.masteredCount} done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </LazySection>
              );
            })}
        </div>

        {filteredDecks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm">No decks found</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
