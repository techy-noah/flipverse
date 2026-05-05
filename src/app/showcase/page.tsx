'use client';

import { useState, useCallback } from 'react';
import { Header, BottomNav, FlipCard, DeckCard, StatCard } from '@/components';
import { Question, Deck, StatItem, AnswerAction } from '@/types';

const sampleQuestion: Question = {
  id: 'q1',
  question: 'Who built the ark according to Genesis?',
  answer: 'Noah',
  reference: 'Genesis 6:14',
  book: 'Genesis',
  category: 'old_testament',
  difficulty: 'easy',
  explanation: 'God instructed Noah to build an ark to save his family and pairs of every animal from the great flood.',
};

const sampleDeck: Deck = {
  id: 'deck-ot',
  name: 'Old Testament',
  category: 'old_testament',
  description: 'Key stories and figures from Genesis to Malachi',
  icon: 'book',
  color: '#6C5CE7',
  totalQuestions: 12,
  masteredCount: 5,
  learningCount: 3,
  newCount: 4,
};

const sampleStats: StatItem[] = [
  { label: 'Total Cards', value: 72, color: 'primary' },
  { label: 'Mastered', value: 24, color: 'success' },
  { label: 'To Review', value: 15, color: 'error' },
  { label: 'Streak', value: '7 days', color: 'warning' },
];

export default function ComponentShowcase() {
  const [currentCard, setCurrentCard] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const handleAnswer = useCallback((action: AnswerAction) => {
    console.log('Answer:', action, 'Question:', sampleQuestion.id);
    setTotalAnswered((prev) => prev + 1);
    setCurrentCard((prev) => prev + 1);
  }, []);

  const handleNext = useCallback(() => {
    console.log('Next card');
    setCurrentCard((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    console.log('Prev card');
    setCurrentCard((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <div className="min-h-screen pb-20 max-w-[360px] mx-auto">
      <Header title="Components" />

      <div className="px-4 py-4 space-y-6">
        {/* FlipCard Section */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">FlipCard</h2>
          <FlipCard
            question={sampleQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            currentIndex={currentCard}
            totalCards={12}
          />
          <p className="text-xs text-text-muted text-center mt-2">
            {totalAnswered} cards answered
          </p>
        </section>

        {/* DeckCard Section */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">DeckCard</h2>
          <DeckCard deck={sampleDeck} />
        </section>

        {/* StatCard Section */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">StatCard</h2>
          <div className="grid grid-cols-2 gap-3">
            {sampleStats.map((stat) => (
              <StatCard key={stat.label} item={stat} compact />
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
