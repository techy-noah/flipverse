import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type DeckRow = Tables['decks']['Row'];
export type QuestionRow = Tables['questions']['Row'];
export type DeckQuestion = Tables['deck_questions']['Row'];
export type UserProgress = Tables['user_progress']['Row'];
export type DailyChallenge = Tables['daily_challenges']['Row'];

export interface Question {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  reference?: string;
  difficulty: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type ProgressStatus = 'new' | 'knew' | 'didnt_know';

export interface DeckWithProgress extends Deck {
  total_questions: number;
  mastered: number;
  learning: number;
  new_cards: number;
}

export interface QuizState {
  currentIndex: number;
  isFlipped: boolean;
  answers: Record<string, ProgressStatus>;
  completed: boolean;
}

export type SwipeDirection = 'left' | 'right' | null;
