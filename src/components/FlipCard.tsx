'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { Question, AnswerAction } from '@/types';
import { ActionButtons } from './ActionButtons';

interface FlipCardProps {
  question: Question;
  onAnswer: (action: AnswerAction) => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCards: number;
}

const SWIPE_THRESHOLD = 50;
const FLIP_DURATION = 250;
const SWIPE_DURATION = 200;

export const FlipCard = memo(function FlipCard({ question, onAnswer, onNext, onPrev, currentIndex, totalCards }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animateOut, setAnimateOut] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startTime = useRef(0);
  const isDraggingRef = useRef(false);
  const isFlippedRef = useRef(false);
  const questionIdRef = useRef(question.id);

  isDraggingRef.current = isDragging;
  isFlippedRef.current = isFlipped;
  questionIdRef.current = question.id;

  const difficultyColors = {
    easy: 'bg-success/15 text-success',
    medium: 'bg-warning/15 text-warning',
    hard: 'bg-error/15 text-error',
  };

  const difficultyLabel: 'easy' | 'medium' | 'hard' = typeof question.difficulty === 'number'
    ? (['easy', 'medium', 'hard'][question.difficulty - 1] as 'easy' | 'medium' | 'hard') || 'easy'
    : question.difficulty || 'easy';

  const applySwipeVelocity = useCallback((offset: number, velocity: number) => {
    const effectiveThreshold = Math.max(SWIPE_THRESHOLD - velocity * 20, SWIPE_THRESHOLD * 0.5);

    if (Math.abs(offset) > effectiveThreshold) {
      const direction = offset < 0 ? 'left' : 'right';
      setAnimateOut(direction);
      setSwipeOffset(offset < 0 ? -window.innerWidth : window.innerWidth);

      setTimeout(() => {
        if (direction === 'left') {
          onNext();
        } else {
          onPrev();
        }
        setAnimateOut(null);
        setSwipeOffset(0);
      }, SWIPE_DURATION);
    } else {
      setSwipeOffset(0);
    }
  }, [onNext, onPrev]);

  const handlePointerStart = useCallback((clientX: number) => {
    if (isFlippedRef.current || animateOut) return;
    startX.current = clientX;
    startTime.current = Date.now();
    setIsDragging(true);
  }, [animateOut]);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current || isFlippedRef.current || animateOut) return;
    const deltaX = clientX - startX.current;
    const resistance = 1 - Math.min(Math.abs(deltaX) / (window.innerWidth * 1.5), 0.6);
    setSwipeOffset(deltaX * resistance);
  }, [animateOut]);

  const handlePointerEnd = useCallback(() => {
    if (!isDraggingRef.current || animateOut) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }

    if (isFlippedRef.current) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }

    const offset = swipeOffset;
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(offset) / Math.max(elapsed, 1);

    setIsDragging(false);
    applySwipeVelocity(offset, velocity);
  }, [swipeOffset, animateOut, applySwipeVelocity]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handlePointerStart(e.touches[0].clientX);
  }, [handlePointerStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handlePointerMove(e.touches[0].clientX);
  }, [handlePointerMove]);

  const onTouchEnd = useCallback(() => {
    handlePointerEnd();
  }, [handlePointerEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handlePointerStart(e.clientX);
  }, [handlePointerStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX);
  }, [handlePointerMove]);

  const onMouseUp = useCallback(() => {
    handlePointerEnd();
  }, [handlePointerEnd]);

  const handleTap = useCallback(() => {
    if (!isDragging && !animateOut) {
      setIsFlipped((f) => !f);
    }
  }, [isDragging, animateOut]);

  const handleAnswer = useCallback((action: AnswerAction) => {
    if (animateOut) return;
    setAnimateOut(action === 'knew' ? 'left' : 'right');
    setTimeout(() => {
      onAnswer(action);
      setAnimateOut(null);
      setIsFlipped(false);
    }, FLIP_DURATION);
  }, [onAnswer, animateOut]);

  const isSwipingLeft = swipeOffset < -10;
  const isSwipingRight = swipeOffset > 10;

  const swipeTranslateX = animateOut
    ? (animateOut === 'left' ? -window.innerWidth : window.innerWidth)
    : swipeOffset;

  const cardTransform = isFlipped
    ? `rotateY(180deg) translateX(${swipeTranslateX * 0.3}px)`
    : `translateX(${swipeTranslateX}px) rotateY(${swipeTranslateX * 0.05}deg)`;

  const cardTransition = animateOut
    ? `transform ${SWIPE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
    : isDragging
    ? 'none'
    : `transform ${FLIP_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <div className="w-full" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        className="relative w-full cursor-pointer select-none"
        style={{
          height: '420px',
          transformStyle: 'preserve-3d',
          transition: cardTransition,
          transform: cardTransform,
          willChange: 'transform',
          WebkitTapHighlightColor: 'transparent',
        }}
        onClick={handleTap}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTap();
          }
          if (e.key === 'ArrowLeft' && !isFlipped) {
            onPrev();
          }
          if (e.key === 'ArrowRight' && !isFlipped) {
            onNext();
          }
        }}
      >
        {/* Front - Question */}
        <div
          className="absolute inset-0 bg-surface rounded-2xl border border-border flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="text-xs text-text-muted font-medium">
              {currentIndex + 1} / {totalCards}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[difficultyLabel]}`}>
              {difficultyLabel}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-4">
            <p className="text-lg font-medium text-text text-center leading-relaxed">
              {question.question}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <path d="M15 3h6v6" />
              <path d="m14 10 7-7" />
              <path d="M9 21H3v-6" />
              <path d="m10 14-7 7" />
            </svg>
            <span className="text-xs text-text-muted">Tap to reveal answer</span>
          </div>

          {/* Swipe indicators */}
          {isDragging && isSwipingRight && currentIndex > 0 && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-success/60 transition-opacity duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </div>
          )}
          {isDragging && isSwipingLeft && currentIndex < totalCards - 1 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error/60 transition-opacity duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Back - Answer */}
        <div
          className="absolute inset-0 bg-surface rounded-2xl border border-border flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            willChange: 'transform',
          }}
        >
          <div className="flex items-center justify-center px-4 pt-4">
            <span className="text-xs text-text-muted font-medium">Answer</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-2">
            <p className="text-lg font-semibold text-text text-center leading-relaxed">
              {question.answer}
            </p>
            {question.reference && (
              <p className="text-sm text-primary font-medium text-center">
                — {question.reference}
              </p>
            )}
            {question.explanation && (
              <p className="text-xs text-text-secondary text-center leading-relaxed line-clamp-3">
                {question.explanation}
              </p>
            )}
          </div>

          <div className="px-4 pb-4">
            <ActionButtons onKnew={() => handleAnswer('knew')} onDidntKnow={() => handleAnswer('didnt_know')} />
          </div>
        </div>
      </div>
    </div>
  );
});
