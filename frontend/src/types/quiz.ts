export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export interface Question {
  id?: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answers: string[];
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
}

export interface CreateQuizInput {
  title: string;
  questions: Omit<Question, 'id'>[];
}

export interface QuizSubmission {
  answers: Record<string, string | string[]>;
}

export interface QuestionDetailResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswers: string[];
  userAnswer: string | string[] | null;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  details: QuestionDetailResult[];
}
