

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  CODE_REVIEW = 'CODE_REVIEW',
  QUIZ = 'QUIZ',
  MARKETING = 'MARKETING',
  CODE_GEN = 'CODE_GEN',
  LIBRARY = 'LIBRARY'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum TechStack {
  FRONTEND = 'Front-End (HTML, CSS, JS, React)',
  PYTHON = 'Python'
}

export interface UserStats {
  points: number;
  level: number;
  badges: string[];
  streak: number;
  totalTime: number; // in minutes
  totalActivities: number; // total number of generations/actions
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}