'use client';

import { useState, useMemo } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { DeckCard } from '@/components/DeckCard';
import { decks as allDecks } from '@/lib/data/decks';
import { getQuestionsByDeck } from '@/lib/data/questions';
import { useProgress } from '@/hooks/useProgress';

export default function DecksPage() {
  const { getDeckProgress } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');

  const decksWithProgress = useMemo(() => {
    return allDecks.map((deck) => {
      const questions = getQuestionsByDeck(deck.id);
      const questionIds = questions.map((q) => q.id);
      const progress = getDeckProgress(questionIds);

      return {
        ...deck,
        total_questions: questions.length,
        mastered: progress.mastered,
        learning: progress.learning,
        new: progress.new,
      };
    });
  }, [getDeckProgress]);

  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decksWithProgress;
    const query = searchQuery.toLowerCase();
    return decksWithProgress.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
    );
  }, [decksWithProgress, searchQuery]);

  return (
    <div className="min-h-screen">
      <Header title="Decks" />

      <div className="px-4 py-4">
        <div className="relative mb-4">
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
            className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
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
