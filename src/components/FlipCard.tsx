'use client';

import { useState, useCallback, useRef } from 'react';
import { Question, ProgressStatus } from '@/types';

interface FlipCardProps {
  question: Question;
  onAnswer: (status: ProgressStatus) => void;
  currentIndex: number;
  totalCards: number;
}

export function FlipCard({ question, onAnswer, currentIndex, totalCards }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;
    setSwipeOffset(deltaX);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    if (Math.abs(swipeOffset) > 80) {
      if (swipeOffset > 0 && currentIndex > 0) {
        onAnswer('new');
      } else if (swipeOffset < 0 && currentIndex < totalCards - 1) {
        onAnswer('new');
      }
    }
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, totalCards, onAnswer]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX.current;
      setSwipeOffset(deltaX);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      handleTouchEnd();
    }
  }, [isDragging, handleTouchEnd]);

  const handleTap = useCallback(() => {
    if (Math.abs(swipeOffset) < 5) {
      setIsFlipped(!isFlipped);
    }
  }, [isFlipped, swipeOffset]);

  const rotateY = isFlipped ? 180 : 0;
  const translateX = isDragging ? swipeOffset : 0;
  const opacity = Math.max(0.5, 1 - Math.abs(swipeOffset) / 300);

  return (
    <div className="relative w-full" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className="relative w-full cursor-pointer select-none"
        style={{
          minHeight: '320px',
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 300ms ease-in-out',
          transform: `rotateY(${rotateY}deg) translateX(${translateX}px)`,
          opacity,
        }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Answer card' : 'Question card'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTap();
          }
        }}
      >
        {/* Front of card - Question */}
        <div
          className="absolute inset-0 bg-surface rounded-2xl border border-border p-6 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">
              {currentIndex + 1} / {totalCards}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary font-medium">
              Difficulty {question.difficulty}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-medium text-text text-center leading-relaxed">
              {question.question}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-text-muted">Tap to reveal answer</span>
          </div>
        </div>

        {/* Back of card - Answer */}
        <div
          className="absolute inset-0 bg-surface rounded-2xl border border-border p-6 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">Answer</span>
            {question.reference && (
              <span className="text-xs px-2 py-1 rounded-full bg-surface-elevated text-text-secondary">
                {question.reference}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-semibold text-text text-center leading-relaxed">
              {question.answer}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnswer('didnt_know');
              }}
              className="flex-1 h-10 bg-error/15 hover:bg-error/25 text-error rounded-lg font-medium text-sm transition-colors"
            >
              Still Learning
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnswer('knew');
              }}
              className="flex-1 h-10 bg-success/15 hover:bg-success/25 text-success rounded-lg font-medium text-sm transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
