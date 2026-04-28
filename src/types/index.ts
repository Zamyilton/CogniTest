export interface Question {
  id: string;
  type: 'iq' | 'eq' | 'sq';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correct: number;
}

export interface TestConfig {
  type: 'iq' | 'eq' | 'sq';
  name: string;
  description: string;
  duration: number; // in seconds
  questionCount: number;
  accentColor: string;
  categories: string[];
}

export interface TestState {
  userName: string;
  testType: 'iq' | 'eq' | 'sq';
  questions: Question[];
  answers: Record<number, number>; // questionIndex -> optionIndex
  currentIndex: number;
  startTime: number;
  elapsedTime: number;
  tabSwitches: number;
  isPaused: boolean;
  isComplete: boolean;
}

export interface TestResult {
  userName: string;
  testType: 'iq' | 'eq' | 'sq';
  score: number; // percentage 0-100
  correctCount: number;
  totalQuestions: number;
  elapsedTime: number;
  tabSwitches: number;
  categoryBreakdown: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export type View = 'home' | 'test' | 'results';
