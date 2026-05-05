export interface Question {
  id: string;
  question: string;
  answer: string;
  reference: string;
  book?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | number;
  explanation?: string;
  deck_id?: string;
}

export interface Deck {
  id: string;
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  color: string;
  totalQuestions?: number;
  masteredCount?: number;
  learningCount?: number;
  newCount?: number;
}

export interface UserProgress {
  questionId: string;
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  wrongCount: number;
  lastReviewed?: string;
  nextReview?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatarUrl?: string;
  streakCount: number;
  totalCorrect: number;
  totalWrong: number;
  lastActive: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

export type AnswerAction = 'knew' | 'didnt_know';
export type ProgressStatus = 'new' | 'knew' | 'didnt_know' | 'learning' | 'mastered';
